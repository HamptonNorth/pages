---
title: systemd processes on Ubuntu
summary: List, stop, start and restart systemd processes on Ubuntu
created: 2025-12-22
published: y
file-type: markdown
style: github
---

# Systemd Cheat Sheet

A quick reference for managing systemd services on Ubuntu.

## Listing Services

```bash
systemctl list-units --type=service            # running services
systemctl list-units --type=service --all      # all services including inactive
systemctl list-unit-files --type=service       # all installed service files
```

## Checking Status

```bash
systemctl status bun-starter.service                         # detailed status of a service
systemctl is-active bun-starter.service                      # just returns active/inactive
systemctl is-enabled bun-starter.service                     # whether it starts on boot
```

## Starting, Stopping, Restarting

```bash
sudo systemctl start bun-starter.service
sudo systemctl stop bun-starter.service
sudo systemctl restart bun-starter.service                   # full stop then start
sudo systemctl reload bun-starter.service                    # reload config without stopping (if supported)
```

## Enabling/Disabling on Boot

```bash
sudo systemctl enable bun-starter.service                    # start on boot
sudo systemctl disable bun-starter.service                   # don't start on boot
sudo systemctl enable --now bun-starter.service              # enable and start immediately
```

## Viewing Logs

```bash
journalctl -u bun-starter.service                            # all logs for a service
journalctl -u bun-starter.service -f                         # follow/tail logs
journalctl -u bun-starter.service --since "10 min ago"       # recent logs
```

---

> **Note:** `sudo` is needed for anything that changes state (start/stop/enable) but not for read-only commands like `status` or `list-units`.
