---
title: Docker Cheat Sheet
summary: A concise reference for the most used Docker commands.
created: 2025-12-20
published: y
file-type: markdown
style: github
---
# Docker CLI Cheat Sheet

## Images
| Command | Description |
|---------|-------------|
| `docker pull <image>` | Download image from registry |
| `docker build -t <n> <path>` | Build image from Dockerfile |
| `docker images` | List local images |
| `docker rmi <image>` | Remove image |

```bash
docker pull gamosoft/notediscovery
docker build -t notediscovery .
docker images | grep notediscovery
docker rmi gamosoft/notediscovery
```

## Containers
| Command | Description |
|---------|-------------|
| `docker run [opts] <image>` | Create & start container |
| `docker ps [-a]` | List running [-a = all] containers |
| `docker stop <container>` | Stop container |
| `docker start <container>` | Start stopped container |
| `docker restart <container>` | Restart container |
| `docker rm <container>` | Remove container |
| `docker logs [-f] <container>` | View logs [-f = follow] |
| `docker exec -it <container> <cmd>` | Run command in container |

```bash
docker run -d --name notediscovery -p 8080:80 gamosoft/notediscovery
docker run -d --name notediscovery -v notedata:/app/data gamosoft/notediscovery
docker ps -a | grep notediscovery
docker stop notediscovery
docker start notediscovery
docker restart notediscovery
docker logs -f notediscovery
docker exec -it notediscovery /bin/sh
```

## Volumes & Networks
| Command | Description |
|---------|-------------|
| `docker volume create <n>` | Create named volume |
| `docker volume ls` | List volumes |
| `docker volume inspect <v>` | Show volume details |
| `docker volume rm <v>` | Remove volume |
| `docker network create <n>` | Create network |

```bash
docker volume create notedata
docker volume ls
docker volume inspect notedata
docker volume rm notedata
docker network create notenet
docker run -d --name notediscovery --network notenet -v notedata:/app/data gamosoft/notediscovery
```

## Cleanup
| Command | Description |
|---------|-------------|
| `docker system prune [-a]` | Remove unused data [-a = all unused images] |

```bash
docker system prune -a --volumes
```

## File operations
To perform file operations like creating directories and moving files, you can either work inside the container or transfer files from your host computer to the container.

1. Create a directory inside the container
Use docker container exec to run the standard Linux mkdir command inside your running container.

```bash
# Create the directory /data/_templates (the -p flag creates parent directories if needed)
docker container exec notediscovery mkdir -p /data/_templates
```

2. Move a file (2 common scenarios)
Scenario A: Move a file that is ALREADY inside the container
If the file is already in the container (e.g., in /tmp) and you just want to move it to your new folder:

```bash
# Move 'config.json' from /tmp to your new templates folder
docker container exec notediscovery mv /tmp/config.json /data/_templates/
```

Scenario B: Move a file from your COMPUTER into the container
If the file is on your actual laptop/desktop and you want to "upload" it into the container's new directory:

```bash
# Copy 'local-template.html' from your current folder to the container's directory
docker container cp ./local-template.html notediscovery:/data/_templates/
```

🔍 Verification
After running the commands above, you should always verify the result to ensure the file landed in the right spot:

```bash
# List the contents of the new directory to confirm the move
docker container exec notediscovery ls -la /data/_templates
```
