#! /bin/bash


if [ "$1" != "-u" ] ; then
 if [ "$3" != "-d" ] ; then
    echo Usage $0 -u URL -d destination file1 file2 file3 ...
    exit
 fi
fi
url=$2
dest=$4

shift
shift
shift
shift

for file in "$@"
do
cadaver $url <<EOF
cd $dest
put $file
quit
EOF
rm -f $file
done
