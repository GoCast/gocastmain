#include <vector>
#include "logging.h"
#include "voemanager.h"
#include "com_gocast_kddidemo_KDDIDemoActivity.h"

class Globals
{
    public:
        static JavaVM* pJVM;
        static JNIEnv* pEnv;
        static GoCast::VoEManager* pVoEManager;
        static std::vector<int> activeChannels;
};

JavaVM* Globals::pJVM = NULL;
JNIEnv* Globals::pEnv = NULL;
GoCast::VoEManager* Globals::pVoEManager = NULL;
std::vector<int> Globals::activeChannels;

#ifdef __cplusplus
extern "C" {
#endif

jint JNI_OnLoad(JavaVM* pJVM, void*)
{
    Globals::pJVM = pJVM;
    if(NULL == Globals::pJVM)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pJVM null");
        return -1;
    }

    if(JNI_OK != (Globals::pJVM)->GetEnv(reinterpret_cast<void**>(&(Globals::pEnv)), JNI_VERSION_1_4))
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pEnv null");
        return -1;
    }

    return JNI_VERSION_1_4;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    init
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_init
  (JNIEnv *, jclass)
{
    Globals::pVoEManager = new GoCast::VoEManager();

    bool res = (Globals::pVoEManager)->GetSubAPIs(BASE_SUBAPI|CODEC_SUBAPI|APM_SUBAPI);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->GetSubAPIs() failed");
        return false;
    }

    res = (Globals::pVoEManager)->BaseAPIInit();
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIInit() failed");
        return false;
    }

    res = (Globals::pVoEManager)->ApmAPISetNsStatus(true);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->ApmAPISetNsStatus() failed");
        return false;
    }

    res = (Globals::pVoEManager)->ApmAPISetAgcStatus(true);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->ApmAPISetAgcStatus() failed");
        return false;
    }

    res = (Globals::pVoEManager)->ApmAPISetEcStatus(true);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->ApmAPISetEcStatus() failed");
        return false;
    }

    res = (Globals::pVoEManager)->ApmAPISetAecmMode();
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->ApmAPISetAecmMode() failed");
        return false;
    }

    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    deinit
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_deinit
  (JNIEnv *, jclass)
{
    bool res = (Globals::pVoEManager)->BaseAPIDeinit();
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIDeinit() failed");
        return false;
    }

    delete (Globals::pVoEManager);

    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    connect
 * Signature: (Ljava/lang/String;II)Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_connect
  (JNIEnv *, jobject, jstring jDestIp, jint jDestPort, jint jLocalPort)
{
    int channel;
    std::string destIp = (Globals::pEnv)->GetStringUTFChars(jDestIp, NULL);

    bool res = (Globals::pVoEManager)->BaseAPIAddChannel(destIp, jDestPort, jLocalPort, channel);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIAddChannel() failed");
        return false;
    }

    res = (Globals::pVoEManager)->CodecAPISetChannelCodec(channel, 0);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->CodecAPISetChannelCodec() failed");
        return false;
    }

    res = (Globals::pVoEManager)->BaseAPIActivateChannel(channel);
    if(false == res)
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIActivateChannel() failed");
        return false;
    }

    (Globals::activeChannels).push_back(channel);

    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    disconnect
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_disconnect
  (JNIEnv *, jobject)
{
    for(std::vector<int>::iterator it = (Globals::activeChannels).begin();
        (Globals::activeChannels).end() != it;
        it++)
    {
        bool res = (Globals::pVoEManager)->BaseAPIDeactivateChannel(*it);
        if(false == res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIDeactivateChannel() failed");
            return false;
        }

        res = (Globals::pVoEManager)->BaseAPIRemChannel(*it);
        if(false == res)
        {
            GOCAST_LOG_ERROR("VOETEST-NDK", "pVoEManager->BaseAPIRemChannel() failed");
            return false;
        }
    }

    (Globals::activeChannels).clear();

    return true;
}

#ifdef __cplusplus
}
#endif

