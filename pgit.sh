git fetch
if [ $(git status -sb | wc -l) -eq "## master...origin/master" ]; then
  echo "  🟢 Git repo is clean."
else
  echo "  🔴 Git repo dirty. Quit."
  git pull
fi
