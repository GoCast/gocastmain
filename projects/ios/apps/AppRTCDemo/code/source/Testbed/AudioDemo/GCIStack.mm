#include "GCIStack.h"

GCIStack* gStackInstance = NULL;

@implementation PCObserver {
    id<APPRTCSendMessage> _delegate;
}

- (id)initWithDelegate:(id<APPRTCSendMessage>)delegate
{
    if (self = [super init])
    {
        _delegate = delegate;
    }
    return self;
}

- (void)peerConnectionOnError:(RTCPeerConnection *)peerConnection
{
#pragma unused(peerConnection)
    NSLog(@"PCO onError.");
    NSAssert(NO, @"PeerConnection failed.");
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection signalingStateChanged:(RTCSignalingState)stateChanged {
#pragma unused(peerConnection, stateChanged)
    NSLog(@"PCO onSignalingStateChange.");
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection addedStream:(RTCMediaStream *)stream {
#pragma unused(peerConnection)
    NSLog(@"PCO onAddStream.");
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        NSAssert([stream.audioTracks count] >= 1,
                 @"Expected at least 1 audio stream");
        //NSAssert([stream.videoTracks count] >= 1,
        //         @"Expected at least 1 video stream");
        // TODO(hughv): Add video support
    });
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection
         removedStream:(RTCMediaStream *)stream {
#pragma unused(peerConnection, stream)

    NSLog(@"PCO onRemoveStream.");
    // TODO(hughv): Remove video track.
}

- (void) peerConnectionOnRenegotiationNeeded:(RTCPeerConnection *)peerConnection {
#pragma unused(peerConnection)
    NSLog(@"PCO onRenegotiationNeeded.");
    // TODO(hughv): Handle this.
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection gotICECandidate:(RTCICECandidate *)candidate
{
#pragma unused(peerConnection)
    NSLog(@"PCO onICECandidate.\n  Mid[%@] Index[%d] Sdp[%@]",
          candidate.sdpMid,
          candidate.sdpMLineIndex,
          candidate.sdp);
    NSDictionary *json =
    @{ @"type" : @"candidate",
       @"label" : [NSNumber numberWithInt:candidate.sdpMLineIndex],
       @"id" : candidate.sdpMid,
       @"candidate" : candidate.sdp };
    NSError *error;
    NSData *data =
    [NSJSONSerialization dataWithJSONObject:json options:0 error:&error];
    if (!error)
    {
        [_delegate sendData:data];
    }
    else
    {
        NSLog(@"Unable to serialize JSON object with error: %@", error.localizedDescription);
        assert(0);
    }
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection
   iceGatheringChanged:(RTCICEGatheringState)newState {
#pragma unused(peerConnection)
    NSLog(@"PCO onIceGatheringChange. %d", newState);
}

- (void)peerConnection:(RTCPeerConnection *)peerConnection
  iceConnectionChanged:(RTCICEConnectionState)newState {
#pragma unused(peerConnection)
    NSLog(@"PCO onIceConnectionChange. %d", newState);
}

@end

@implementation GCIStack

- (id)init
{
    self = [super init];

    gStackInstance = self;
    
    [RTCPeerConnectionFactory initializeSSL];

    return self;
}

#pragma mark - RTCSendMessage method

- (void)sendData:(NSData *)data
{
#pragma unused(data)
//    [self.client sendData:data];
}

- (void)onICEServers:(NSArray*)servers
{
#pragma unused(servers)

}

- (void) pcConstruct:(const std::string&)newConfig
{
#pragma unused(newConfig)
    self.peerConnectionFactory = [[RTCPeerConnectionFactory alloc] init];

    NSString* pcConfig = [NSString stringWithUTF8String:newConfig.c_str()];

    NSError *error;
    NSData *pcData = [pcConfig dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json =
    [NSJSONSerialization JSONObjectWithData:pcData options:0 error:&error];
//    if(error)
//    {
//        NSLog(@"Unable to parse.  %@", error.localizedDescription);
//        assert(0);
//    }
    NSArray *servers = [json objectForKey:@"iceServers"];
    NSMutableArray *ICEServers = [NSMutableArray array];
    for (NSDictionary *server in servers) {
        NSString *url = [server objectForKey:@"url"];
        NSString *credential = [server objectForKey:@"credential"];
        if (!credential) {
            credential = @"";
        }
        NSLog(@"url [%@] - credential [%@]", url, credential);
        RTCICEServer *ICEServer =
        [[RTCICEServer alloc] initWithURI:[NSURL URLWithString:url]
                                 password:credential];
        [ICEServers addObject:ICEServer];
    }

    self.pcObserver = [[PCObserver alloc] initWithDelegate:self];

    self.peerConnection =
    [self.peerConnectionFactory peerConnectionWithICEServers:ICEServers
                                                 constraints:nil
                                                    delegate:self.pcObserver];

}

- (void) pcAddStream
{

}

- (void) pcClose
{

}

- (void) pcCreateAnswer
{

}

- (void) pcCreateOffer
{

}

- (void) pcSetLocalDescription
{

}

- (void) pcSetRemoteDescription
{

}

@end

