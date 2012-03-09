#ifndef PCOBSERVER_H_
#define PCOBSERVER_H_

#include <string>
#include <map>
#include "talk/base/sigslot.h"
#include "talk/base/scoped_ptr.h"
#include "talk/base/physicalsocketserver.h"
#include "talk/app/webrtc/peerconnection.h"
#include "talk/app/webrtc/peerconnectionfactory.h"
#include "pcthreadsafemessagequeue.h"

namespace GoCast
{
    namespace PeerConnectionTest
    {
        class PCObserver: public sigslot::has_slots<>, public webrtc::PeerConnectionObserver
        {
            public:
                enum State {NOT_CONNECTED, SIGNING_IN, CONNECTED, SIGNING_OUT_WAITING, SIGNING_OUT};

                explicit PCObserver(ThreadSafeMessageQueue* pMsgQ,
                                    const std::string& serverIP,
                                    const int serverPort);
                virtual ~PCObserver();
		bool HandleNextMessage(bool& bQuit);

            protected:
		bool Signin(const std::string& name);
                bool SendToPeer(const int peerId, const std::string& msg);
                bool Signout();
                void Close();
                bool ConnectControlSocket();
                bool GetHeaderValue(const std::string& data,
                                    size_t eoh,
                                    const char* pHeaderPattern,
                                    size_t* pValue);
                bool GetHeaderValue(const std::string& data,
                                    size_t eoh,
                                    const char* pHeaderPattern,
                                    std::string* pValue);
                bool ReadIntoBuffer(talk_base::AsyncSocket* pSocket,
                                    std::string* pData,
                                    size_t* pContentLength);
                bool ParseEntry(const std::string& entry,
                                std::string* pName,
                                int* pId,
                                bool* pConnected);
                bool ParseServerResponse(const std::string& response,
                                         size_t contentLength,
                                         size_t* pPeerId,
                                         size_t* pEoh);
                int GetResponseStatus(const std::string& response);
                void OnConnect(talk_base::AsyncSocket* pSocket);
                void OnHangingGetConnect(talk_base::AsyncSocket* pSocket);
                void OnControlDataAvailable(talk_base::AsyncSocket* pSocket);
                void OnHangingGetDataAvailable(talk_base::AsyncSocket* pSocket);
                void OnClose(talk_base::AsyncSocket* pSocket, int err);

            protected:
                int m_id;
                State m_state;
                std::string m_name;
                ThreadSafeMessageQueue* m_pMsgQ;
                std::map<int,std::string> m_peers;
			
            protected:
                std::string m_onConnectData;
                std::string m_ctrlData;
                std::string m_notifyData;
                talk_base::SocketAddress m_serverAddr;
                talk_base::scoped_ptr<talk_base::AsyncSocket> m_spCtrlSocket;
                talk_base::scoped_ptr<talk_base::AsyncSocket> m_spHangingGet;


            public:
                bool InitPeerConnectionFactory();
                bool DeinitPeerConnectionFactory();
                virtual void OnError() { }
                virtual void OnSignalingMessage(const std::string& message);
                virtual void OnAddStream(const std::string& streamId, bool bVideo);
                virtual void OnRemoveStream(const std::string& streamId, bool bVideo);

            protected:
                bool InitPeerConnection(const int peerId);
                bool DeinitPeerConnection();
                bool CommitAudioStream();
                bool AttemptConnection(const int peerId);
                bool TerminateConnection();
                bool OnMessageFromPeer(const int peerId, const std::string& msg);

            protected:
                int m_peerId;
                talk_base::scoped_ptr<cricket::MediaEngineInterface> m_pMediaEngine;
                talk_base::scoped_ptr<cricket::DeviceManagerInterface> m_pDeviceManager;
                talk_base::scoped_ptr<talk_base::Thread> m_pWorkerThread;
                talk_base::scoped_ptr<webrtc::PeerConnection> m_pPeerConnection;
                talk_base::scoped_ptr<webrtc::PeerConnectionFactory> m_pPeerConnectionFactory;
        };
    }
}

#endif

