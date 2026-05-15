#!/usr/bin/env bash
# =============================================================================
# install.sh — register print-md as a right-click "Open With" handler for
# .md files on Fedora / Ubuntu (and any freedesktop-compliant DE).
#
# Run from this directory:   ./install.sh
# Uninstall:                  ./install.sh --uninstall
# =============================================================================

set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_NAME="print-md.desktop"
APPS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DEST_DESKTOP="$APPS_DIR/$DESKTOP_NAME"

uninstall() {
  if [[ -f "$DEST_DESKTOP" ]]; then
    rm -f "$DEST_DESKTOP"
    echo "Removed $DEST_DESKTOP"
  else
    echo "Nothing to uninstall at $DEST_DESKTOP"
  fi
  command -v update-desktop-database >/dev/null && \
    update-desktop-database "$APPS_DIR" >/dev/null 2>&1 || true
  echo "Done."
  exit 0
}

[[ "${1:-}" == "--uninstall" ]] && uninstall

# --- Sanity checks -----------------------------------------------------------
command -v node >/dev/null || { echo "node is required (install Node.js)"; exit 1; }
command -v xdg-open >/dev/null || { echo "xdg-open is required (xdg-utils)"; exit 1; }

# --- Install npm deps if missing ---------------------------------------------
if [[ ! -d "$SRC_DIR/node_modules/marked" ]]; then
  echo "Installing dependencies..."
  (cd "$SRC_DIR" && npm install --omit=dev --no-audit --no-fund)
fi

# --- Write the desktop file with absolute Exec path --------------------------
mkdir -p "$APPS_DIR"
sed "s|__INSTALL_DIR__|$SRC_DIR|g" "$SRC_DIR/$DESKTOP_NAME.in" > "$DEST_DESKTOP"
chmod 644 "$DEST_DESKTOP"
echo "Installed $DEST_DESKTOP"

# --- Refresh desktop database ------------------------------------------------
command -v update-desktop-database >/dev/null && \
  update-desktop-database "$APPS_DIR" >/dev/null 2>&1 || true

# --- Optional: make it the default for .md (uncomment to enable) -------------
# xdg-mime default "$DESKTOP_NAME" text/markdown
# xdg-mime default "$DESKTOP_NAME" text/x-markdown

cat <<EOF

Done.

Right-click any .md file → "Open With Other Application…" → "Print Markdown".
After picking it once, it will appear directly in the "Open With" submenu.

To make it the *default* opener for .md files:
  xdg-mime default $DESKTOP_NAME text/markdown
  xdg-mime default $DESKTOP_NAME text/x-markdown

To uninstall:
  $SRC_DIR/install.sh --uninstall

CSS lives at: $SRC_DIR/print-md.css  (edit freely)
EOF
