env "dev" {
  url = "postgres://hyperbaric_admin:hyperbaric_password@localhost:5432/null_horizon?sslmode=disable"
  dev = "docker://postgres/17/dev"

  schema {
    src = "file://schemas"
    # Atlas Registry config
    repo {
      name = "null-horizon"
    }
  }
  schemas = ["auth", "asset", "financial", "public"]
}

env "prod" {
  url = env("DATABASE_URL")
  schema {
    src = "file://schemas"
    # Atlas Registry config
    repo {
      name = "null-horizon"
    }
  }
  schemas = ["auth", "asset", "financial", "public"]
}
