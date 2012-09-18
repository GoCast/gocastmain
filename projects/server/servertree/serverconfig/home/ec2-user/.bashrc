# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

export PATH="$PATH":~/webrtc_plugin/depot_tools
export NODE_PATH=/usr/local/lib/node_modules:$NODE_PATH

# User specific aliases and functions
export LD_LIBRARY_PATH=/home/ec2-user/libs:/usr/lib:/lib:/usr/local/lib
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
