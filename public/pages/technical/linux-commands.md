---
title: Example back up script
summary: A simple back up script and explanation of cron.
created: 2025-12-20
published: y
file-type: markdown
style: github
---
# Example: `daily_backup.sh`
This script finds all .log files in the current directory, copies them to a timestamped folder, and compresses them.

```Bash

#!/bin/bash

# 1. VARIABLES
# Store the current date in a variable (Format: YYYY-MM-DD)
DATE=$(date +%Y-%m-%d)
# Define the backup folder name using the date variable
BACKUP_DIR="logs_backup_$DATE"

# 2. CONDITIONAL (Check if files exist)
# "ls *.log" lists log files. "> /dev/null 2>&1" hides output/errors.
if ls *.log > /dev/null 2>&1; then
    echo "Starting backup for $DATE..."
else
    echo "No .log files found to backup!"
    exit 1  # Stop the script with an error code
fi

# 3. CREATE DIRECTORY
mkdir -p "$BACKUP_DIR"
echo "Created directory: $BACKUP_DIR"

# 4. LOOP
# Iterate through every file ending in .log
for file in *.log; do
    cp "$file" "$BACKUP_DIR"
    echo "Copied $file"
done

# 5. COMPRESS & CLEANUP
# Compress the folder into a .tar.gz file
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Remove the temporary folder (now that we have the zip)
rm -rf "$BACKUP_DIR"

echo "✅ Success! Backup saved as $BACKUP_DIR.tar.gz"
```

### How to Run It
Create the file: `nano daily_backup.sh` (Paste the code above, then Ctrl+O, Enter, Ctrl+X).

Make it executable: `chmod +x daily_backup.sh`

Run it: `./daily_backup.sh`

If you want to automate this to run every day at 5 PM automatically, add this script to a Cron Job.

### Cron Jobs (Scheduling)
Run `crontab -e` to edit your schedule.
Format: `m h dom mon dow command `

| Expression |Meaning | 
| -------- | ------- |
|`0 17 * * * `| Run every day at 5:00 PM |
|`*/10 * * * * `| Run every 10 minutes |
|`0 0 * * 0`| Run every Sunday at midnight
