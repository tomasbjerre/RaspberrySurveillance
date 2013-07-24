#! /bin/bash
if [ "$1" != "-d" ] ; then
   echo Usage $0 -d destination file1 file2 file3 ...
   exit
fi
dest=$2
shift
shift

for file in "$@"
do
cadaver http://localhost/owncloud/files/webdav.php <<EOF
cd $dest
put $file
quit
EOF
rm -f $file
done
