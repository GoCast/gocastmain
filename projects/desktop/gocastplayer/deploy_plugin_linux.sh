#!/bin/bash

cd build

mkdir -p GoCastPlayer
cp bin/GCP/npGCP.so GoCastPlayer/npGCP_`uname -m`.so
cp ../README_linux GoCastPlayer/README_linux

# create install.sh
echo "Generating GoCastPlayer/install.sh"
echo "#!/bin/bash" > GoCastPlayer/install.sh
echo "" >> GoCastPlayer/install.sh
echo "echo \"GoCastPlayer Install: Plugin will be installed in ~/.mozilla/plugins\"" >> GoCastPlayer/install.sh
echo "mkdir -p ~/.mozilla" >> GoCastPlayer/install.sh
echo "mkdir -p ~/.mozilla/plugins" >> GoCastPlayer/install.sh
echo "cp npGCP_*.so ~/.mozilla/plugins/" >> GoCastPlayer/install.sh
echo "echo \"GoCastPlayer Install: Done\"" >> GoCastPlayer/install.sh
echo "" >> GoCastPlayer/install.sh

# add user executable permission
chmod u+x GoCastPlayer/install.sh

#Package install.sh and npGCP_[i686|x86_64].so
rm -f GoCastPlayer_`uname -m`.tar.gz
tar czvf GoCastPlayer_`uname -m`.tar.gz GoCastPlayer/install.sh GoCastPlayer/README_linux GoCastPlayer/npGCP_`uname -m`.so

cd ..

