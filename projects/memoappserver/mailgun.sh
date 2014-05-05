#
# mailgun script
#
curl -s --user 'api:key-65ism99rlme7svrn93qc-cormdknx-42' \
    https://api.mailgun.net/v2/carouselmail.gocast.it/messages \
    -F from='admin@gocast.it' \
    -F to=${1} \
    -F subject='GocastTalk Password Reset' \
    -F text="Reset Token:${2}"
