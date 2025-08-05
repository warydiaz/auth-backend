terraform {
  required_version = ">= 1.3.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_compute_network" "vpc" {
  name = "rstp-network"
}

resource "google_compute_subnetwork" "subnet_a" {
  name          = "subnet-a"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.name
}

resource "google_compute_subnetwork" "subnet_b" {
  name          = "subnet-b"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.vpc.name
}

resource "google_compute_global_address" "private_ip_range" {
  name          = "google-managed-services-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
  depends_on              = [google_compute_subnetwork.subnet_a, google_compute_subnetwork.subnet_b]
}

resource "google_sql_database_instance" "postgres" {
  name             = "postgres-instance"
  database_version = "POSTGRES_14"
  region           = var.region

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier              = "db-custom-1-3840"
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }
}

resource "google_redis_instance" "redis" {
  name               = "redis-instance"
  tier               = "STANDARD_HA"
  memory_size_gb     = 4
  region             = var.region
  redis_version      = "REDIS_6_X"
  authorized_network = google_compute_network.vpc.id
}

resource "google_compute_instance" "app_a" {
  name         = "app-a"
  machine_type = "e2-medium"
  zone         = var.zone_a

  tags = ["http-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet_a.name
    access_config {}
  }

  service_account {
    email  = var.service_account_email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  depends_on = [
    google_sql_database_instance.postgres,
    google_redis_instance.redis
  ]

  metadata_startup_script = templatefile("${path.module}/startup.sh.tpl", {
    db_host               = google_sql_database_instance.postgres.ip_address[0].ip_address
    redis_host            = google_redis_instance.redis.host
    project_id            = var.project_id
    region                = var.region
    image_tag             = "4239a2bfdcee"
    services_docker_image = "${var.region}-docker.pkg.dev/${var.project_id}/services-docker/auth-backend:4239a2bfdcee"
    features_docker_image = "${var.region}-docker.pkg.dev/${var.project_id}/services-docker/features-docker:4239a2bfdcee"
  })
}

resource "google_compute_instance" "app_b" {
  name         = "app-b"
  machine_type = "e2-medium"
  zone         = var.zone_b

  tags = ["http-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet_b.name
    access_config {}
  }

  service_account {
    email  = var.service_account_email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  depends_on = [
    google_sql_database_instance.postgres,
    google_redis_instance.redis
  ]

  metadata_startup_script = templatefile("${path.module}/startup.sh.tpl", {
    db_host               = google_sql_database_instance.postgres.ip_address[0].ip_address
    redis_host            = google_redis_instance.redis.host
    project_id            = var.project_id
    region                = var.region
    image_tag             = "4239a2bfdcee"
    services_docker_image = "${var.region}-docker.pkg.dev/${var.project_id}/services-docker/auth-backend:4239a2bfdcee"
    features_docker_image = "${var.region}-docker.pkg.dev/${var.project_id}/services-docker/features-docker:4239a2bfdcee"
  })
}

resource "google_compute_instance_group" "group_a" {
  name      = "group-a"
  zone      = var.zone_a
  instances = [google_compute_instance.app_a.self_link]

  named_port {
    name = "http"
    port = 80
  }

  named_port {
    name = "http8080"
    port = 8080
  }
}

resource "google_compute_instance_group" "group_b" {
  name      = "group-b"
  zone      = var.zone_b
  instances = [google_compute_instance.app_b.self_link]

  named_port {
    name = "http"
    port = 80
  }

  named_port {
    name = "http8080"
    port = 8080
  }
  depends_on = [google_compute_instance.app_b]
}

resource "google_compute_http_health_check" "default" {
  name         = "basic-check"
  request_path = "/"
  port         = 80
}

resource "google_compute_http_health_check" "check_8080" {
  name         = "check-8080"
  request_path = "/"
  port         = 8080
}

resource "google_compute_backend_service" "backend" {
  name                  = "backend-service"
  load_balancing_scheme = "EXTERNAL"
  protocol              = "HTTP"

  backend {
    group = google_compute_instance_group.group_a.self_link
  }

  backend {
    group = google_compute_instance_group.group_b.self_link
  }

  health_checks = [google_compute_http_health_check.default.self_link]
  port_name     = "http"
}

resource "google_compute_backend_service" "backend_8080" {
  name                  = "backend-8080-service"
  load_balancing_scheme = "EXTERNAL"
  protocol              = "HTTP"

  backend {
    group           = google_compute_instance_group.group_a.self_link
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }

  backend {
    group           = google_compute_instance_group.group_b.self_link
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }

  port_name     = "http8080"
  health_checks = [google_compute_http_health_check.check_8080.self_link]
}

resource "google_compute_url_map" "url_map" {
  name = "url-map"

  default_service = google_compute_backend_service.backend.self_link

  host_rule {
    hosts        = ["*"]
    path_matcher = "matcher"
  }

  path_matcher {
    name            = "matcher"
    default_service = google_compute_backend_service.backend.self_link

    path_rule {
      paths   = ["/api8080/*"]
      service = google_compute_backend_service.backend_8080.self_link
    }
  }
}

resource "google_compute_target_http_proxy" "http_proxy" {
  name    = "http-proxy"
  url_map = google_compute_url_map.url_map.self_link
}

resource "google_compute_global_address" "lb_ip" {
  name = "lb-ip"
}

resource "google_compute_global_forwarding_rule" "http_forwarding_rule" {
  name       = "http-forwarding-rule"
  port_range = "80"
  target     = google_compute_target_http_proxy.http_proxy.self_link
  ip_address = google_compute_global_address.lb_ip.address
}

resource "google_compute_firewall" "allow_health_check_8080" {
  name    = "allow-health-check-8080"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  source_ranges = [
    "130.211.0.0/22",
    "35.191.0.0/16"
  ] # Google Health Check IP ranges

  direction   = "INGRESS"
  target_tags = ["http-server"]
  priority    = 1000
  description = "Allow health checks to reach app on port 8080"
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
  target_tags   = ["http-server"]
  priority      = 1000
  description   = "Allow HTTP traffic"
}

output "redis_host" {
  value = google_redis_instance.redis.host
}

output "postgres_private_ip" {
  value = google_sql_database_instance.postgres.ip_address[0].ip_address
}

output "load_balancer_ip" {
  value = google_compute_global_address.lb_ip.address
}
