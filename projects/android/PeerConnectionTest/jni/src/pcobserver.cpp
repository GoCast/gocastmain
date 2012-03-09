#include <android/log.h>
#include <sstream>
#include "talk/base/common.h"
#include "talk/base/nethelpers.h"
#include "talk/base/logging.h"
#include "talk/base/stringutils.h"
#include "talk/session/phone/mediaengine.h"
#include "talk/session/phone/webrtcvoiceengine.h"
#include "talk/p2p/client/basicportallocator.h"
#include "pcobserver.h"

#define PCTEST_LOG_DBG(msg) __android_log_print(ANDROID_LOG_DEBUG, "PCTEST-NDK", msg)
#define PCTEST_LOG_ERR(msg) __android_log_print(ANDROID_LOG_ERROR, "PCTEST-NDK", msg)
#define PCTEST_LOG_WRN(msg) __android_log_print(ANDROID_LOG_ERROR, "PCTEST-NDK", msg)

using talk_base::sprintfn;

namespace
{
    talk_base::AsyncSocket* CreateClientSocket()
    {
        talk_base::Thread* thread = talk_base::Thread::Current();
        if(NULL == thread)
        {
            PCTEST_LOG_ERR("CreateClientSocket() failed");    
            return NULL;   
        }
        return thread->socketserver()->CreateAsyncSocket(SOCK_STREAM);
    }    
}

namespace GoCast
{
    namespace PeerConnectionTest
    {
        PCObserver::~PCObserver()
        {
        }

        PCObserver::PCObserver(ThreadSafeMessageQueue* pMsgQ,
                               const std::string& serverIP,
                               const int serverPort)
        : m_id(-1)
        , m_state(NOT_CONNECTED)
        , m_name("")
        , m_pMsgQ(pMsgQ)
        , m_spCtrlSocket(CreateClientSocket())
        , m_spHangingGet(CreateClientSocket())
        {
            m_spCtrlSocket->SignalCloseEvent.connect(this,&PCObserver::OnClose);
            m_spCtrlSocket->SignalConnectEvent.connect(this,&PCObserver::OnConnect);
            m_spCtrlSocket->SignalReadEvent.connect(this,&PCObserver::OnControlDataAvailable);
            m_spHangingGet->SignalCloseEvent.connect(this,&PCObserver::OnClose);
            m_spHangingGet->SignalConnectEvent.connect(this,&PCObserver::OnHangingGetConnect);
            m_spHangingGet->SignalReadEvent.connect(this,&PCObserver::OnHangingGetDataAvailable);
            
            m_serverAddr.SetIP(serverIP);
            m_serverAddr.SetPort(serverPort);
        }

        bool PCObserver::Signin(const std::string& name) 
        {
            m_name = name;
            if (m_state != NOT_CONNECTED)
            {
                PCTEST_LOG_WRN("The client must not be connected before you can call Connect()");
                return false;
            }
            
            if (m_serverAddr.IsUnresolved())
            {
                int errcode = 0;
                hostent* h = talk_base::SafeGetHostByName(m_serverAddr.IPAsString().c_str(), &errcode);
                if (!h)
                {
                    std::string msg = "Failed to resolve host name: ";
                    msg += m_serverAddr.IPAsString();
                    PCTEST_LOG_ERR(msg.c_str());
                    return false;
                }
                else
                {
                    m_serverAddr.SetResolvedIP(ntohl(*reinterpret_cast<uint32*>(h->h_addr_list[0])));
                    talk_base::FreeHostEnt(h);
                }
            }
            
            char buffer[1024];
            sprintfn(buffer, sizeof(buffer),"GET /sign_in?%s HTTP/1.0\r\n\r\n", m_name.c_str());
            m_onConnectData = buffer;
            
            std::string msg = "Signin: [";
            msg += (m_serverAddr.IPAsString() + ": ");
            msg += (m_name + "]");
            PCTEST_LOG_DBG(msg.c_str());
 
            bool ret = ConnectControlSocket();
            if (ret)
            {
                m_state = SIGNING_IN;
            }
            
            return ret;
        }

        bool PCObserver::SendToPeer(const int peerId, const std::string& msg) 
        {
            if (m_state != CONNECTED)
            {
                return false;
            }
        
            if (m_id == -1 || peerId == -1)
            {
                return false;
            }
        
            char headers[1024];
            sprintfn(headers, sizeof(headers),
                     "POST /message?peer_id=%i&to=%i HTTP/1.0\r\n"
                     "Content-Length: %i\r\n"
                     "Content-Type: text/plain\r\n"
                     "\r\n",
                     m_id, peerId, msg.length());
            m_onConnectData = headers;
            m_onConnectData += msg;
            return ConnectControlSocket();
        }

        bool PCObserver::Signout() 
        {
            if (m_state == NOT_CONNECTED || m_state == SIGNING_OUT)
            {
                return true;
            }
            
            if (m_spHangingGet->GetState() != talk_base::Socket::CS_CLOSED)
            {
                m_spHangingGet->Close();
            }
            
            if (m_spCtrlSocket->GetState() == talk_base::Socket::CS_CLOSED)
            {
                m_state = SIGNING_OUT;
                
                if (m_id != -1)
                {
                    char buffer[1024];
                    sprintfn(buffer, sizeof(buffer),
                             "GET /sign_out?peer_id=%i HTTP/1.0\r\n\r\n", m_id);
                    m_onConnectData = buffer;
                    return ConnectControlSocket();
                } 
                else
                {
                    // Can occur if the app is closed before we finish connecting.
                    return true;
                }
            } 
            else
            {
                m_state = SIGNING_OUT_WAITING;
            }
            
            return true;
        }

        bool PCObserver::HandleNextMessage(bool& bQuit)
        {
            bool bStatus = false;
            ParsedMessage msg;
            
            bQuit = false;
            if(false == m_pMsgQ->GetNext(msg))
            {
                return false;
            }
            
            if(true == msg["command"].empty())
            {
                return true;
            }
            
            if("signin" == msg["command"])
            {
                if(NOT_CONNECTED != m_state || -1 < m_id)
                {
                    PCTEST_LOG_WRN("Already signed in or in the process");
                    return false;
                }
                
                bStatus = Signin(msg["name"]);
                if(false == bStatus)
                {
                    PCTEST_LOG_ERR("Signin attempt failed");
                }
            }
            else if("signout" == msg["command"])
            {
                if(CONNECTED != m_state || -1 == m_id)
                {
                    PCTEST_LOG_WRN("Already signed out or in the process");
                    return false;
                }
                
                bStatus = Signout();
                if(false == bStatus)
                {
                    PCTEST_LOG_ERR("Signout attempt failed");
                }                
            }
            else if("quit" == msg["command"])
            {
                PCTEST_LOG_DBG("Quitting");
                bQuit = true;
            }
            else if("sendtopeer" == msg["command"])
            {
                std::stringstream sstrm;
                int peerId;

                sstrm << msg["peerid"];
                sstrm >> peerId;
		bStatus = SendToPeer(peerId, msg["message"]);
                if(false == bStatus)
                {
                    std::string errmsg = "Unable to send to: ";
                    errmsg += msg["peerid"];
                    PCTEST_LOG_ERR(errmsg.c_str());
                    
                }

                PCTEST_LOG_DBG(msg["message"].c_str());
            }
            else if("call" == msg["command"])
            {
                std::stringstream sstrm;
                int peerId;

                sstrm << msg["peerid"];
                sstrm >> peerId;
                bStatus = AttemptConnection(peerId);
                if(false == bStatus)
                {
                    std::string errmsg = "Unable to attempt connection with: ";
                    errmsg += msg["peerid"];
                    PCTEST_LOG_ERR(errmsg.c_str());
                }
            }
            else if("hangup" == msg["command"])
            {
                bStatus = TerminateConnection();
                if(false == bStatus)
                {
                    PCTEST_LOG_ERR("Unable to terminate connection");
                }
            }

            return bStatus;
        }
        
        void PCObserver::Close() 
        {
            m_spCtrlSocket->Close();
            m_spHangingGet->Close();
            m_onConnectData.clear();
            m_peers.clear();
            m_id = -1;
            m_state = NOT_CONNECTED;
        }

        bool PCObserver::ConnectControlSocket() 
        {
            int err;
            
            if(m_spCtrlSocket->GetState() != talk_base::Socket::CS_CLOSED)
            {
                return true;
            }

            if ((err = m_spCtrlSocket->Connect(m_serverAddr)) == SOCKET_ERROR)
            {
                Close();
                return false;
            }
            
            return true;
        }

        void PCObserver::OnConnect(talk_base::AsyncSocket* pSocket)
        {
            size_t sent = pSocket->Send(m_onConnectData.c_str(), m_onConnectData.length());        

            if(m_onConnectData.length() > sent)
            {
                std::string msg = "Failed to send to server: ";
                msg += m_onConnectData;
                PCTEST_LOG_ERR(msg.c_str());
            }
            
            UNUSED(sent);
            m_onConnectData.clear();
        }

        void PCObserver::OnHangingGetConnect(talk_base::AsyncSocket* pSocket)
        {
            char buffer[1024];

            sprintfn(buffer, sizeof(buffer),
                     "GET /wait?peer_id=%i HTTP/1.0\r\n\r\n", m_id);

            int len = strlen(buffer);
            int sent = pSocket->Send(buffer, len);

            if(len > sent)
            {
                std::string msg = "Failed to send to server: ";
                msg += buffer;
                PCTEST_LOG_ERR(msg.c_str());
            }
            
            UNUSED2(sent, len);
        }

        bool PCObserver::GetHeaderValue(const std::string& data,
                                        size_t eoh,
                                        const char* pHeaderPattern,
                                        size_t* pValue)
        {
            size_t found = data.find(pHeaderPattern);
            if (found != std::string::npos && found < eoh)
            {
                *pValue = atoi(&data[found + strlen(pHeaderPattern)]);
                return true;
            }
            
            return false;
        }

        bool PCObserver::GetHeaderValue(const std::string& data,
                                        size_t eoh,
                                        const char* pHeaderPattern,
                                        std::string* pValue)
        {
            size_t found = data.find(pHeaderPattern);
            if (found != std::string::npos && found < eoh)
            {
                size_t begin = found + strlen(pHeaderPattern);
                size_t end = data.find("\r\n", begin);
                if (end == std::string::npos)
                {
                    end = eoh;
                }
                
                pValue->assign(data.substr(begin, end - begin));
                return true;
            }
            
            return false;
        }

        bool PCObserver::ReadIntoBuffer(talk_base::AsyncSocket* pSocket,
                                        std::string* pData,
                                        size_t* pContentLength)
        {        
            char buffer[0xffff];
            do
            {
                int bytes = pSocket->Recv(buffer, sizeof(buffer));
                if (bytes <= 0)
                {
                    break;
                }
                
                pData->append(buffer, bytes);
            } while (true);
            
            bool ret = false;
            size_t i = pData->find("\r\n\r\n");
            if (i != std::string::npos)
            {
                if (GetHeaderValue(*pData, i, "\r\nContent-Length: ", pContentLength))
                {
                    size_t total_response_size = (i + 4) + *pContentLength;
                    if (pData->length() >= total_response_size)
                    {
                        ret = true;
                        std::string should_close;
                        const char kConnection[] = "\r\nConnection: ";
                        if (GetHeaderValue(*pData, i, kConnection, &should_close) &&
                            should_close.compare("close") == 0)
                        {
                            pSocket->Close();
                            // Since we closed the socket, there was no notification delivered
                            // to us.  Compensate by letting ourselves know.
                            OnClose(pSocket, 0);
                        }
                    } 
                    else
                    {
                        ;// We haven't received everything.  Just continue to accept data.
                    }
                } 
                else
                {
                    PCTEST_LOG_ERR("No content length field specified by the server");
                }
            }
            
            return ret;
        }

        void PCObserver::OnControlDataAvailable(talk_base::AsyncSocket* pSocket)
        {
            size_t content_length = 0;
            if (ReadIntoBuffer(pSocket, &m_ctrlData, &content_length))
            {
                size_t peer_id = 0, eoh = 0;
                bool ok = ParseServerResponse(m_ctrlData,
                                              content_length,
                                              &peer_id,
                                              &eoh);
                if (ok)
                {
                    if (m_id == -1) 
                    {
                        // First response.  Let's store our server assigned ID.
                        if(m_state != SIGNING_IN)
                        {
                            PCTEST_LOG_ERR("State should be 'SIGNING_IN'");
                            return;
                        }
                        
                        m_id = peer_id;
                        
                        // The body of the response will be a list of already connected peers.
                        if (content_length) 
                        {
                            size_t pos = eoh + 4;
                            while (pos < m_ctrlData.size()) 
                            {
                                size_t eol = m_ctrlData.find('\n', pos);
                                if (eol == std::string::npos)
                                {
                                    break;
                                }
                                
                                int id = 0;
                                std::string name;
                                bool connected;
                                if (ParseEntry(m_ctrlData.substr(pos, eol - pos), &name, &id,
                                               &connected) && id != m_id) 
                                {
                                    m_peers[id] = name;
                                    
                                    std::string msg = "Peer[";
                                    std::stringstream sstrm;
                                    sstrm << id;
                                    msg += (name + ", " + sstrm.str() + "] online");
                                    PCTEST_LOG_DBG(msg.c_str());
                                }
                                
                                pos = eol + 1;
                            }
                        }
                        
                        PCTEST_LOG_DBG("Client: Sign in complete");
                    }
                    else if (m_state == SIGNING_OUT) 
                    {
                        Close();
                        PCTEST_LOG_DBG("Client: Signing out");
                        
                        ParsedMessage msg;
                        msg["command"] = "quit";
                        m_pMsgQ->Post(msg);
                    } 
                    else if (m_state == SIGNING_OUT_WAITING) 
                    {
                        Signout();
                        PCTEST_LOG_DBG("Client: Signing out waiting");
                    }
                }
                
                m_ctrlData.clear();
                if (m_state == SIGNING_IN) 
                {
                    m_state = CONNECTED;
                    if(m_spHangingGet->GetState() == talk_base::Socket::CS_CLOSED)
                    {
                        m_spHangingGet->Connect(m_serverAddr);
                    }
                }
            }
        }

        void PCObserver::OnHangingGetDataAvailable(talk_base::AsyncSocket* pSocket)
        {
            size_t content_length = 0;
            if (ReadIntoBuffer(pSocket, &m_notifyData, &content_length)) 
            {
                size_t peer_id = 0, eoh = 0;
                bool ok = ParseServerResponse(m_notifyData, 
                                              content_length,
                                              &peer_id, &eoh);
                
                if (ok) 
                {
                    // Store the position where the body begins.
                    size_t pos = eoh + 4;
                    
                    if (m_id == static_cast<int>(peer_id)) 
                    {
                        // A notification about a new member or a member that just
                        // disconnected.
                        int id = 0;
                        std::string name;
                        bool connected = false;
                        if (ParseEntry(m_notifyData.substr(pos), &name, &id,
                                       &connected)) 
                        {
                            if (connected) 
                            {
                                m_peers[id] = name;
                               
				std::stringstream sstrm; 
                                std::string msg = "Peer[";
                                sstrm << id;
                                msg += (name + ", " + sstrm.str() + "] online");
                                PCTEST_LOG_DBG(msg.c_str());
                            } 
                            else 
                            {
                                m_peers.erase(id);
                                std::string msg = "Peer[";
                                msg += (name + "] offine");
                                PCTEST_LOG_DBG(msg.c_str());
                            }
                        }
                    } 
                    else 
                    {
                        std::string msg = m_peers[peer_id];
                        msg += ": ";
                        msg += m_notifyData.substr(pos);
                        PCTEST_LOG_DBG(msg.c_str());
                        
                        OnMessageFromPeer(peer_id, m_notifyData.substr(pos));
                    }
                }
                
                m_notifyData.clear();
            }
            
            if (m_spHangingGet->GetState() == talk_base::Socket::CS_CLOSED &&
                m_state == CONNECTED) 
            {
                m_spHangingGet->Connect(m_serverAddr);
            }
        }

        bool PCObserver::ParseEntry(const std::string& entry,
                                    std::string* pName,
                                    int* pId,
                                    bool* pConnected)
        {
            *pConnected = false;
            size_t separator = entry.find(',');
            if (separator != std::string::npos) 
            {
                *pId = atoi(&entry[separator + 1]);
                pName->assign(entry.substr(0, separator));
                separator = entry.find(',', separator + 1);
                if (separator != std::string::npos) 
                {
                    *pConnected = atoi(&entry[separator + 1]) ? true : false;
                }
            }
            
            return !pName->empty();
        }

        int PCObserver::GetResponseStatus(const std::string& response)
        {
            int status = -1;
            size_t pos = response.find(' ');
            if (pos != std::string::npos)
            {
                status = atoi(&response[pos + 1]);
            }
            
            return status;
        }

        bool PCObserver::ParseServerResponse(const std::string& response,
                                             size_t contentLength,
                                             size_t* pPeerId,
                                             size_t* pEoh)
        {
            LOG(INFO) << response;
            int status = GetResponseStatus(response.c_str());
            if (status != 200) 
            {
                PCTEST_LOG_ERR("Received error from server");
                Close();
                return false;
            }
            
            *pEoh = response.find("\r\n\r\n");
            if (*pEoh == std::string::npos)
            {    
                return false;
            }
            
            *pPeerId = -1;
            
            // See comment in peer_channel.cc for why we use the Pragma header and
            // not e.g. "X-Peer-Id".
            GetHeaderValue(response, *pEoh, "\r\nPragma: ", pPeerId);
            
            return true;
        }

        void PCObserver::OnClose(talk_base::AsyncSocket* pSocket, int err)
        {            
            pSocket->Close();            
            if (err != ECONNREFUSED) 
            {
                if (pSocket == m_spHangingGet.get()) 
                {
                    if (m_state == CONNECTED) {
                        PCTEST_LOG_ERR("Issuing  a new hanging get");
                        m_spHangingGet->Close();
                        m_spHangingGet->Connect(m_serverAddr);
                    }
                } 
                else 
                {
                    //TODO: CONTROL SOCKET CLOSED -- DO SOMETHING
                    PCTEST_LOG_WRN("Control socket closed");
                }
            } 
            else 
            {
                PCTEST_LOG_ERR("Failed to connect to the server");
                Close();
            }
        }

        bool PCObserver::InitPeerConnectionFactory()
        {
            if(NULL == m_pWorkerThread.get())
            {
                m_pWorkerThread.reset(new talk_base::Thread());
                if(false == m_pWorkerThread->SetName("Worker", this) ||
                   false == m_pWorkerThread->Start())
                {
                    PCTEST_LOG_ERR("Unable to start libjingle worker thread");
                    m_pWorkerThread.reset();
                    return false;
                }
            }

            if(NULL == m_pPeerConnectionFactory.get())
            {
                cricket::PortAllocator* pPortAllocator = 
                    new cricket::BasicPortAllocator(
                        new talk_base::BasicNetworkManager(),
                        talk_base::SocketAddress("stun.l.google.com", 19302),
                        talk_base::SocketAddress(),
                        talk_base::SocketAddress(),
                        talk_base::SocketAddress()
                    );

                m_pMediaEngine.reset(new cricket::CompositeMediaEngine
                                     <cricket::WebRtcVoiceEngine,
                                     cricket::NullVideoEngine>());
                m_pDeviceManager.reset(new cricket::DeviceManager());

                m_pPeerConnectionFactory.reset(
                    new webrtc::PeerConnectionFactory(
                        pPortAllocator,
                        m_pMediaEngine.get(),
                        m_pDeviceManager.get(),
                        m_pWorkerThread.get()
                    )
                );

                PCTEST_LOG_DBG("Before initialize");

                if(false == m_pPeerConnectionFactory->Initialize())
                {
                    PCTEST_LOG_ERR("Unable to init peerconnection factory");
                    DeinitPeerConnectionFactory();
                    return false;
                }

                PCTEST_LOG_DBG("After initialize");
            }

            return true;
        }

        bool PCObserver::DeinitPeerConnectionFactory()
        {
            m_pPeerConnectionFactory.reset();
            m_pMediaEngine.reset();
            m_pDeviceManager.reset();
            m_pWorkerThread.reset();

            return true;
        }

        void PCObserver::OnSignalingMessage(const std::string& message)
        {
            ParsedMessage msg;
            std::stringstream sstrm;

            sstrm << m_peerId;
            msg["command"] = "sendtopeer";
            msg["peerid"] = sstrm.str();
            msg["message"] = message;
            m_pMsgQ->Post(msg);
        }

        void PCObserver::OnAddStream(const std::string& streamId, bool bVideo)
        {
            std::string msg = (m_peers[m_peerId] + " added remote stream ");
            msg += streamId;
            PCTEST_LOG_DBG(msg.c_str());
        }

        void PCObserver::OnRemoveStream(const std::string& streamId, bool bVideo)
        {
            std::string msg = (m_peers[m_peerId] + " removed remote stream ");
            msg += streamId;
            PCTEST_LOG_DBG(msg.c_str());
        }

        bool PCObserver::InitPeerConnection(const int peerId)
        {
            if(NULL == m_pPeerConnection.get())
            {
                m_peerId = peerId;
                m_pPeerConnection.reset(
                    m_pPeerConnectionFactory->CreatePeerConnection(
                        m_pWorkerThread.get()
                    )
                );

                if(NULL == m_pPeerConnection.get())
                {
                    PCTEST_LOG_ERR("Unable to create peerconnection");
                    return false;
                }

                m_pPeerConnection->RegisterObserver(this);
                int audioOpts = cricket::MediaEngineInterface::ECHO_CANCELLATION |
                                cricket::MediaEngineInterface::NOISE_SUPPRESSION;

                if(false == m_pPeerConnection->SetAudioDevice("", "", audioOpts))
                {
                    PCTEST_LOG_ERR("SetAudioDevice() failed");
                    DeinitPeerConnection();
                    return false;
                }
            }

            return true;
        }

        bool PCObserver::DeinitPeerConnection()
        {
            m_pPeerConnection.reset();
            m_peerId = -1;
        }

        bool PCObserver::CommitAudioStream()
        {
            if(false == m_pPeerConnection->AddStream("voice", false))
            {
                PCTEST_LOG_ERR("Failed to add voice stream");
                return false;
            }

            if(false == m_pPeerConnection->Connect())
            {
                PCTEST_LOG_ERR("Failed to commit audio stream");
                return false;
            }

            return true;
        }

        bool PCObserver::AttemptConnection(const int peerId)
        {
            if(false == InitPeerConnection(peerId))
            {
                PCTEST_LOG_ERR("InitPeerConnection() failed");
                return false;
            }

            if(false == CommitAudioStream())
            {
                PCTEST_LOG_ERR("CommitAudioStream() failed");
                return false;
            }

            return true;
        }

        bool PCObserver::TerminateConnection()
        {
            if(false == m_pPeerConnection->Close())
            {
                PCTEST_LOG_ERR("Failed to close peerconnection");
                return false;
            }

            ParsedMessage msg;
            std::stringstream sstrm;

            sstrm << m_peerId;
            msg["command"] = "sendtopeer";
            msg["peerid"] = sstrm.str();
            msg["message"] = "bye";
            m_pMsgQ->Post(msg);

            DeinitPeerConnection();

            return true;
        }

        bool PCObserver::OnMessageFromPeer(const int peerId, const std::string& msg)
        {
            if("bye" == msg)
            {
                if(NULL == m_pPeerConnection.get())
                {
                    if(false == m_pPeerConnection->Close())
                    {
                        PCTEST_LOG_ERR("Failed to close peerconnection");
                        return false;
                    }
                }

                return true;
            }

            if(false == m_pPeerConnection.get())
            {
                if(false == InitPeerConnection(peerId))
                {
                    PCTEST_LOG_ERR("InitPeerConnection() error");
                    return false;
                }
            }

            if(false == m_pPeerConnection->SignalingMessage(msg))
            {
                PCTEST_LOG_ERR("SignalingMessage() failed");
                return false;
            }

            return true;
        }
    }
}

