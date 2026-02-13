#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://www.limacentro.com}"

check_url() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  echo "$code $url"
}

echo "SEO check for: $BASE_URL"
echo "----------------------------------------"

check_url "$BASE_URL/"
check_url "$BASE_URL/robots.txt"
check_url "$BASE_URL/sitemap.xml"
check_url "$BASE_URL/quienes-somos"

echo "----------------------------------------"
echo "Homepage title + meta description:"
curl -s -L "$BASE_URL/" | tr -d '\n' | sed 's/></>\n</g' | grep -E '<title>|meta name="description"|rel="canonical"' | head -n 10 || true
