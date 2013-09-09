#import <Foundation/Foundation.h>
#include <string>

#import "RTCICECandidate.h"
#import "RTCICEServer.h"
#import "RTCMediaConstraints.h"
#import "RTCMediaStream.h"
#import "RTCPair.h"
#import "RTCPeerConnection.h"
#import "RTCPeerConnectionDelegate.h"
#import "RTCPeerConnectionFactory.h"
#import "RTCSessionDescription.h"

@protocol APPRTCSendMessage<NSObject>
- (void)sendData:(NSData *)data;
@end

@interface PCObserver : NSObject<RTCPeerConnectionDelegate>
- (id)initWithDelegate:(id<APPRTCSendMessage>)delegate;
@end

// Called when there are RTCICEServers.
@protocol ICEServerDelegate<NSObject>

- (void)onICEServers:(NSArray*)servers;

@end

@interface GCIStack : NSObject<
    ICEServerDelegate,
    APPRTCSendMessage
>

@property(nonatomic, strong) PCObserver *pcObserver;
@property(nonatomic, strong) RTCPeerConnection *peerConnection;
@property(nonatomic, strong) RTCPeerConnectionFactory *peerConnectionFactory;

- (id)init;

- (void) pcConstruct:(const std::string&)newConfig;

- (void) pcAddStream;
- (void) pcClose;

- (void) pcCreateAnswer;
- (void) pcCreateOffer;

- (void) pcSetLocalDescription;
- (void) pcSetRemoteDescription;

@end

