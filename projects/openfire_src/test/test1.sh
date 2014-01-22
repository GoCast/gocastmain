#curl -XGET http://localhost:9090/plugins/userService/userservice?type=enable\&secret=dev.GoCast.SecretWU78zz\&username=tom
#curl -XGET http://localhost:9090/plugins/userService/userservice?type=login\&secret=dev.GoCast.SecretWU78zz\&username=tom\&password=2013tom
curl -XGET -H "Content-type: application/json" -H "Accept: application/json" http://localhost:9090/plugins/userService/userservice?type=login\&secret=dev.GoCast.SecretWU78zz\&username=tom\&password=2013tom
