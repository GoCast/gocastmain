#include "rtcengine.h"
#include "logging.h"
#include "com_gocast_kddidemo_KDDIDemoActivity.h"

#define NUM_ANDROID_DEVICES 3
#define ANDROID_DEVICES {"192.168.20.101", "192.168.20.104", "192.168.20.102"}
#define ANDROID_CONNECTION(ip1, ip2) ((ip1) + "+" + (ip2))

class Globals
{
public:
    static JavaVM* pJVM;
    static JNIEnv* pEnv;
    static GoCast::RtcEngine* pRtcEngine;
    static std::string peers[NUM_ANDROID_DEVICES];
    static std::string localIp;
    static std::map<std::string, int> voiceConnectionPorts;
    static std::map<std::string, int> videoConnectionPorts;
};

JavaVM* Globals::pJVM = NULL;
JNIEnv* Globals::pEnv = NULL;
GoCast::RtcEngine* Globals::pRtcEngine = NULL;
std::string (Globals::peers)[NUM_ANDROID_DEVICES] = ANDROID_DEVICES;
std::string Globals::localIp = "";
std::map<std::string, int> Globals::voiceConnectionPorts;
std::map<std::string, int> Globals::videoConnectionPorts;

#ifdef __cplusplus
extern "C" {
#endif

jint JNI_OnLoad(JavaVM* pJVM, void*)
{
    Globals::pJVM = pJVM;
    if(NULL == Globals::pJVM)
    {
        GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pJVM null");
        return -1;
    }
    
    if(JNI_OK != (Globals::pJVM)->GetEnv(reinterpret_cast<void**>(&(Globals::pEnv)), JNI_VERSION_1_4))
    {
        GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pEnv null");
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
(JNIEnv *, jobject context)
{
    if(0 != webrtc::VideoEngine::SetAndroidObjects(Globals::pJVM, context))
    {
        GOCAST_LOG_ERROR("KDDIDEMO-NDK", "webrtc::VideoEngine::SetAndroidObjects() error");
        return false;
    }

    Globals::pRtcEngine = new GoCast::RtcEngine();
    if(false == (Globals::pRtcEngine)->Init())
    {
        GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pRtcEngine->Init() error");
        return false;
    }
    
    int voicePort = 2000;
    int videoPort = 3000;
    
    for(int i=0; i<NUM_ANDROID_DEVICES; i++)
    {
        for(int j=0; j<NUM_ANDROID_DEVICES; j++)
        {
            if(i < j)
            {
                (Globals::voiceConnectionPorts)[
                    ANDROID_CONNECTION((Globals::peers)[i],
                                       (Globals::peers)[j])
                ] = voicePort;
                voicePort += 2;

                
                
                (Globals::videoConnectionPorts)[
                    ANDROID_CONNECTION((Globals::peers)[i],
                                       (Globals::peers)[j])
                ] = videoPort;
                videoPort += 2;
            }
            else if(i > j)
            {
                (Globals::voiceConnectionPorts)[
                    ANDROID_CONNECTION((Globals::peers)[i],
                                       (Globals::peers)[j])
                ] = (Globals::voiceConnectionPorts)[
                        ANDROID_CONNECTION((Globals::peers)[j],
                                           (Globals::peers)[i])
                    ];

                (Globals::videoConnectionPorts)[
                    ANDROID_CONNECTION((Globals::peers)[i],
                                       (Globals::peers)[j])
                ] = (Globals::videoConnectionPorts)[
                        ANDROID_CONNECTION((Globals::peers)[j],
                                           (Globals::peers)[i])
                    ];
            }
        }
    }

    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    deinit
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_deinit
(JNIEnv *, jobject)
{
    if(false == (Globals::pRtcEngine)->Deinit())
    {
        GOCAST_LOG_ERROR("VOETEST-NDK", "pRtcEngine->Deinit() error");
        return false;
    }
    
    (Globals::voiceConnectionPorts).clear();
    (Globals::videoConnectionPorts).clear();
    delete (Globals::pRtcEngine);
    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    start
 * Signature: (Ljava/lang/String;[Landroid/view/SurfaceView;)Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_start
(JNIEnv *, jobject context, jstring jLocalIp, jobjectArray views)
{
    int viewIdx = 0;
    
    jobject view = (Globals::pEnv)->GetObjectArrayElement(views, viewIdx++);
    if(false == (Globals::pRtcEngine)->ActivateLocalRender(view, 0))
    {
        GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pRtcEngine->ActivateLocalRender failed");
        return false;
    }
    
    Globals::localIp = (Globals::pEnv)->GetStringUTFChars(jLocalIp, NULL);
    for(int i=0; i<NUM_ANDROID_DEVICES; i++)
    {
        GOCAST_LOG_DEBUG("KDDIDEMO-NDK", (Globals::peers)[i].c_str());
        
        if(Globals::localIp != (Globals::peers)[i])
        {
            std::string fwdConn = (Globals::localIp) + "+" + (Globals::peers)[i];
            std::string revConn = (Globals::peers)[i] + "+" + (Globals::localIp);
            
            GOCAST_LOG_DEBUG("KDDIDEMO-NDK", fwdConn.c_str());
            GOCAST_LOG_DEBUG("KDDIDEMO-NDK", revConn.c_str());

            int destPorts[2] = {(Globals::voiceConnectionPorts)[fwdConn],
                                (Globals::videoConnectionPorts)[fwdConn]};
            int recvPorts[2] = {(Globals::voiceConnectionPorts)[revConn],
                                (Globals::videoConnectionPorts)[revConn]};
            
            jobject view = (Globals::pEnv)->GetObjectArrayElement(views, viewIdx++);
            if(false == (Globals::pRtcEngine)->NewConnection((Globals::peers)[i],
                                                             destPorts,
                                                             recvPorts,
                                                             view,
                                                             0,
                                                             true))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pRtcEngine->NewConnection() error");
                return false;
            }
        }
    }
    
    return true;
}

/*
 * Class:     com_gocast_kddidemo_KDDIDemoActivity
 * Method:    stop
 * Signature: ()Z
 */
JNIEXPORT jboolean JNICALL Java_com_gocast_kddidemo_KDDIDemoActivity_stop
(JNIEnv *, jobject)
{
    for(int i=0; i<NUM_ANDROID_DEVICES; i++)
    {
        if(Globals::localIp != (Globals::peers)[i])
        {
            if(false == (Globals::pRtcEngine)->DeleteConnection((Globals::peers)[i]))
            {
                GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pRtcEngine->DeleteConnection() error");
                return false;
            }
        }
        
        if(false == (Globals::pRtcEngine)->RemoveLocalRender())
        {
            GOCAST_LOG_ERROR("KDDIDEMO-NDK", "pRtcEngine->RemoveLocalRender() error");
            return false;
        }
    }
    
    return true;
}

#ifdef __cplusplus
}
#endif
