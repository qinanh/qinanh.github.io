#!/usr/bin/env bash
# 本机开发服务器。Ruby 在 micromamba 的 rb 环境里，不在系统 PATH 上。
set -e
export PATH="$HOME/micromamba/envs/rb/bin:$PATH"
export BUNDLE_PATH=vendor/bundle
cd "$(dirname "$0")"
exec bundle exec jekyll serve --livereload --host 0.0.0.0 --port "${1:-4100}"
