# groups=testgroup
curl -XGET -H "Content-type: application/json" -H "Accept: application/json" http://localhost:9090/plugins/userService/userservice?type=add_roster\&secret=dev.GoCast.SecretWU78zz\&username=tom\&authToken=${1}\&groups=${2}\&item_jid=${3}
