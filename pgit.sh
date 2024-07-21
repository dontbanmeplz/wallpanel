git fetch
if git status -sb | grep -q 'behind'; then
  git pull
fi
