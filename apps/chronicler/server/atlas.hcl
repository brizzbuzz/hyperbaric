env "dev" {
  url = "postgres://hyperbaric_admin:hyperbaric_password@localhost:5432/chronicler?sslmode=disable"
  dev = "docker://postgres/17/dev"

  schema {
    src = "file://schemas"
    repo {
      name = "chronicler"
    }
  }
  schemas = ["auth", "asset", "financial", "public"]
}

env "prod" {
  url = env("DATABASE_URL")
  schema {
    src = "file://schemas"
    repo {
      name = "chronicler"
    }
  }
  schemas = ["auth", "asset", "financial", "public"]
}
