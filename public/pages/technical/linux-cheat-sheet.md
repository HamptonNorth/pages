---
title: Linux Terminal Cheat Sheet
summary: A concise reference for the most used Linux commands, text editors, scripting, and automation.
created: 2025-12-20
published: y
file-type: markdown
style: github
---
# 🐧 Linux Terminal Cheat Sheet

A concise reference for the 50 most used Linux commands, text editors, scripting, and automation.

---


### File & Directory Navigation
1. **`ls`** — List directory contents.
   * `ls -la` (All files + details) 
   * `ls -lh` (Human-readable sizes)
2. **`cd`** — Change directory.
   * `cd /path` 
   * `cd ..` (Up one level) 
   * `cd ~` (Home)
3. **`pwd`** — Print Working Directory (show current path).
4. **`mkdir`** — Make directory.
   * `mkdir folder` 
   * `mkdir -p parent/child` (Nested)

### File Manipulation
5. **`cp`** — Copy.
   * `cp file.txt copy.txt` 
   * `cp -r folder1 folder2` (Recursive)
6. **`mv`** — Move or Rename.
   * `mv old.txt new.txt` 
   * `mv file.txt /dest/`
7. **`rm`** — Remove.
   * `rm file.txt` 
   * `rm -i file` (Ask confirm) 
   * ⚠️ `rm -rf folder` (Force delete)
8. **`touch`** — Create empty file or update timestamp.
9. **`ln`** — Create links.
   * `ln -s file link` (Symbolic link/Shortcut)
10. **`cat`** — Display content.
    * `cat file.txt` 
    * `cat a.txt b.txt > combined.txt`

### Text Processing
11. **`grep`** — Search text.
    * `grep "error" log.txt` 
    * `grep -r "text" .` (Recursive)
12. **`echo`** — Print text.
    * `echo "Hi"` | `echo "Log" >> file.txt` (Append)
13. **`less`** — View text page-by-page (`q` to quit).
14. **`head`** — First 10 lines. (`head -n 5 file.txt`)
15. **`tail`** — Last 10 lines.
    * `tail -f log.txt` (Watch file grow in real-time)
16. **`wc`** — Count words/lines. (`wc -l file.txt`)
17. **`sort`** — Sort lines.
    * `sort file.txt` (Alpha) 
    * `sort -n nums.txt` (Numeric)
18. **`uniq`** — Filter duplicates (use after `sort`).
19. **`diff`** — Compare files line-by-line.
20. **`sed`** — Text replacement.
    * `sed 's/old/new/g' file.txt` (Print modified output)
21. **`awk`** — Text processing.
    * `awk '{print $1}' file.txt` (Print 1st column)
22. **`tee`** — Redirect to file AND screen.
    * `echo "Hi" | tee -a log.txt`

### System Info & Management
23. **`sudo`** — Execute as admin.
24. **`uname`** — System info (`uname -a`).
25. **`whoami`** — Current user.
26. **`top` / `htop`** — View active processes.
27. **`ps`** — Process snapshot (`ps aux`).
28. **`kill`** — Terminate process.
    * `kill PID` 
    * `kill -9 PID` (Force kill)
29. **`shutdown`** — Power management.
    * `shutdown now` 
    * `shutdown -r now` (Reboot)
30. **`systemctl`** — Control services.
    * `sudo systemctl start/stop/status service_name`
31. **`date`** — Show/set date.
32. **`which`** — Locate command path (`which python`).

### Disk & Hardware
33. **`df`** — Disk free space (`df -h`).
34. **`du`** — Folder usage (`du -sh folder`).
35. **`mount` / `umount`** — Mount/Unmount drives.

### Permissions
36. **`chmod`** — Change mode.
    * `chmod +x script.sh` (Make executable) 
    * `chmod 755 folder`
37. **`chown`** — Change owner.
    * `chown user:group file`

### Networking
38. **`ping`** — Check connectivity.
39. **`ip`** — Show IP (`ip a`).
40. **`curl`** — Transfer data (`curl https://site.com`).
41. **`wget`** — Download file (`wget url/file.zip`).
42. **`ssh`** — Remote login (`ssh user@host`).
43. **`scp`** — Remote copy (`scp file user@host:/path`).
44. **`ss`** — Socket stats (`ss -tuln` for open ports).

### Archives & Search
45. **`tar`** — Archives.
    * `tar -czvf arc.tar.gz folder` (Compress) 
    * `tar -xzvf arc.tar.gz` (Extract)
46. **`zip` / `unzip`** — Zip format.
47. **`find`** — Search files (`find . -name "*.log"`).
48. **`locate`** — Fast file search (`locate file.txt`).

### Misc
49. **`history`** — Command history.
50. **`alias`** — Shortcuts (`alias ll='ls -la'`).

---

## Nano Editor Shortcuts
Run with: `nano filename`

| Key | Action | Description |
| :--- | :--- | :--- |
| **`Ctrl + O`** | Write Out | Save file. |
| **`Ctrl + X`** | Exit | Close editor. |
| **`Ctrl + W`** | Where Is | Search text. |
| **`Ctrl + K`** | Cut | Delete line. |
| **`Ctrl + U`** | Uncut | Paste line. |

---

## Piping & Redirection
Combine commands to create workflows.

| Operator | Name | Example |
| :--- | :--- | :--- |
| **`\|`** | Pipe | `cat logs.txt \| grep "Error"` (Pass output to next command) |
| **`>`** | Overwrite | `ls > list.txt` (Save output to file) |
| **`>>`** | Append | `echo "End" >> log.txt` (Add to end of file) |
| **`<`** | Input | `sort < names.txt` (Feed file into command) |
| **`&&`** | AND | `mkdir A && cd A` (Run 2nd only if 1st succeeds) |

---

## other useful stuff
To get the external IP address
```bash
curl ifconfig.me
```
