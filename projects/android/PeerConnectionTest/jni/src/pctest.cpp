#include <android/log.h>
#include "pcobserver.h"
#include "pcsocketserver.h"
#include "com_gocast_pctest_PeerConnectionTestActivity.h"

class Globals
{
    public:
        static const std::string SERVER_IP;
        static const int SERVER_PORT;
        static std::string peerName;
        static GoCast::PeerConnectionTest::ThreadSafeMessageQueue* pMsgQ;
        static JavaVM* pJVM;
        static JNIEnv* pEnv;
};

const std::string Globals::SERVER_IP = "video.gocast.it";
const int Globals::SERVER_PORT = 8888;
std::string Globals::peerName = "";
GoCast::PeerConnectionTest::ThreadSafeMessageQueue* Globals::pMsgQ = NULL;
JavaVM* Globals::pJVM = NULL;
JNIEnv* Globals::pEnv = NULL;

#ifdef __cplusplus
extern "C" {
#endif

jint JNI_OnLoad(JavaVM* pJVM, void*)
{
    Globals::pJVM = pJVM;
    if(NULL == Globals::pJVM)
    {
        __android_log_print(ANDROID_LOG_ERROR, "PCTEST-NDK", "jvm null");
        return -1;
    }

    if(JNI_OK != (Globals::pJVM)->GetEnv(reinterpret_cast<void**>(&(Globals::pEnv)), JNI_VERSION_1_4))
    {
        __android_log_print(ANDROID_LOG_ERROR, "PCTEST-NDK", "env null");
        return -1;
    }

    return JNI_VERSION_1_4;
}

/*
 * Class:     com_gocast_pctest_PeerConnectionTestActivity
 * Method:    signin
 * Signature: (Ljava/lang/String;)Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_pctest_PeerConnectionTestActivity_signin
  (JNIEnv *pEnv, jobject, jstring jUserName)
{
    ParsedMessage msg;

    msg["command"] = "signin";
    msg["name"] = pEnv->GetStringUTFChars(jUserName, NULL);
    return (Globals::pMsgQ)->Post(msg);
}

/*
 * Class:     com_gocast_pctest_PeerConnectionTestActivity
 * Method:    signout
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_pctest_PeerConnectionTestActivity_signout
  (JNIEnv *, jobject)
{
    ParsedMessage msg;
    msg["command"] = "signout";
    return (Globals::pMsgQ)->Post(msg);
}

/*
 * Class:     com_gocast_pctest_PeerConnectionTestActivity
 * Method:    call
 * Signature: (Ljava/lang/String;)Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_pctest_PeerConnectionTestActivity_call
  (JNIEnv *pEnv, jobject, jstring jPeerId)
{
    ParsedMessage msg;
    msg["command"] = "call";
    msg["peerid"] = pEnv->GetStringUTFChars(jPeerId, NULL);
    return (Globals::pMsgQ)->Post(msg);
}

/*
 * Class:     com_gocast_pctest_PeerConnectionTestActivity
 * Method:    hangup
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_pctest_PeerConnectionTestActivity_hangup
  (JNIEnv *, jobject)
{
    ParsedMessage msg;
    msg["command"] = "hangup";
    return (Globals::pMsgQ)->Post(msg);
}

JNIEXPORT void JNICALL Java_com_gocast_pctest_PeerConnectionTestActivity_pcObserverWorker
  (JNIEnv *, jobject)
{
    talk_base::AutoThread autoThread;
    talk_base::Thread* pThread = talk_base::Thread::Current();
    GoCast::PeerConnectionTest::PCSocketServer socketServer;

    __android_log_write(ANDROID_LOG_DEBUG, "PCTEST-NDK", "create socket server & msgq");

    Globals::pMsgQ = new GoCast::PeerConnectionTest::ThreadSafeMessageQueue();
    pThread->set_socketserver(&socketServer);

    __android_log_write(ANDROID_LOG_DEBUG, "PCTEST-NDK", "create observer & run thread");

    GoCast::PeerConnectionTest::PCObserver pcObserver(Globals::pMsgQ,
                                                      Globals::SERVER_IP,
                                                      Globals::SERVER_PORT);
    socketServer.RegisterPCObserver(&pcObserver);
    pcObserver.InitPeerConnectionFactory();

    pThread->Run();

    pcObserver.DeinitPeerConnectionFactory();
    pThread->set_socketserver(NULL);
    delete Globals::pMsgQ;
}

#ifdef __cplusplus
}
#endif

