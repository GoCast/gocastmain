#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"

#include "CallcastEvent.h"
#include "CarouselEventManager.h"

#include "Spot.h"
#include "WhiteboardSpot.h"
#include "CarouselApp.h"

#include "AppDelegate.h"

const tDimension2f  kSurfaceSize(256,256);
const tDimension2f  kVisibleSize(500,500);
const tDimension2f  kSpotSize(300,300);

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

static std::string colorToString(const tColor4b& newColor)
{
    if (newColor == kRed)
    {
        return "#F00";
    }
    else if (newColor == kBlue)
    {
        return "#00F";
    }
    else if (newColor == kOrange)
    {
        return "rgb(253, 103, 3)";
    }
    else if (newColor == kWhite)
    {
        return "#FFF";
    }

    return "#000";
}

CarouselApp gCarouselApp;
extern AppDelegate* gAppDelegateInstance;
extern UIWebView*   gWebViewInstance;

static tMatrix4x4f ortho(const float &left, const float &right, const float &bottom, const float &top)
{
    tMatrix4x4f Result(1);

    Result[0][0] = float(2) / (right - left);
    Result[1][1] = float(2) / (top - bottom);
    Result[2][2] = - float(1);
    Result[3][0] = - (right + left) / (right - left);
    Result[3][1] = - (top + bottom) / (top - bottom);

    return Result;
}

static std::vector<tPoint2f> sixPoints(const tPoint2f& toPtA, const tPoint2f& toPtB)
{
    std::vector<tPoint2f> result;

    result.push_back(toPtA);
    result.push_back(tPoint2f(toPtA.x, toPtB.y));
    result.push_back(toPtB);
    result.push_back(toPtB);
    result.push_back(tPoint2f(toPtB.x, toPtA.y));
    result.push_back(toPtA);

    return result;
}

//Resources
void CarouselApp::createResources()
{
    mSpriteProgram = new tProgram(tShader(tShader::kVertexShader,    tFile::fileToString("spritesheet.vert")),
                                  tShader(tShader::kFragmentShader,  tFile::fileToString("spritesheet.frag")));

    tSurface mouse(tPixelFormat::kR8G8B8A8, tDimension2f(32,32));

    tSurface surface(tPixelFormat::kR8G8B8A8, kSurfaceSize);
    surface.fillWhiteAlpha();
//    surface.drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));

    mWhiteboardTexture = new tTexture(surface);

    mWhiteBoardVerts        = sixPoints(tPoint2f(0,0), tPoint2f(kVisibleSize.width, kVisibleSize.height));
    mWhiteBoardTexCoords    = sixPoints(tPoint2f(0,0), tPoint2f(kSurfaceSize.width / mWhiteboardTexture->getSize().width, kSurfaceSize.height / mWhiteboardTexture->getSize().height));
}

//Configure Nodes
void CarouselApp::configureNodes()
{
    //os.root.tag
    //os.init.tag
    //os.init.setFrameBufferState
    glClearColor(1,0,0,1);

    //os.init.setBlendState
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    //os.init.setDepthState
    glDisable(GL_DEPTH_TEST);

    //os.init.setRasterState
    glFrontFace(GL_CCW);
    glDisable(GL_CULL_FACE);

    //os.draw.tag
    //os.draw.setViewportState
    glViewport(0, 0, (int32_t)300, (int32_t)300);

    //os.draw.setProgram
    mSpriteProgram->setActive();

    //os.draw.setProjection
    {
        GLint location;

        location = glGetUniformLocation(mSpriteProgram->mProgramID, "mProjection");
        assert(location != -1);

        static tMatrix4x4f orthoProj = ortho(0,kVisibleSize.width, 0, kVisibleSize.height);
//        static tMatrix4x4f orthoProj = ortho(0,kSurfaceSize.width, kSurfaceSize.height, 0);
        glUniformMatrix4fv(location, 1, false, &orthoProj.mArray[0][0]);
    }

    //os.draw.setToPoint
    {
        GLint location;

        location = glGetUniformLocation(mSpriteProgram->mProgramID, "mToPoint");
        assert(location != -1);

        static tPoint2f origin(0,0);
        glUniform2fv(location, 1, &origin.x);
    }

    //os.draw.setVertices
    {
        GLuint location = (GLuint)glGetAttribLocation(mSpriteProgram->mProgramID, "mVerts");
        assert((GLint)location != -1);

        glEnableVertexAttribArray(location);

        glVertexAttribPointer(location, 2, GL_FLOAT, GL_TRUE, 0, &mWhiteBoardVerts[0]);
    }

    //os.draw.setTexCoords
    {
        GLuint location = (GLuint)glGetAttribLocation(mSpriteProgram->mProgramID, "mTexCoords");
        assert((GLint)location != -1);

        glEnableVertexAttribArray(location);

        glVertexAttribPointer(location, 2, GL_FLOAT, GL_TRUE, 0, &mWhiteBoardTexCoords[0]);
    }
    
}

CarouselApp::CarouselApp()
:   mSpriteProgram(NULL),
    mWhiteboardTexture(NULL),
    mNickname("nick"),
    mRoomname("room"),
    mSpotFinger(0),
    mInputTimer(NULL),
    mJSONTimer(NULL),
    mSendPenColor(kBlue),
    mSendPenSize(5),
    mInitialized(false),
    mShouldCapture(false)
{
    ConstructMachine();
}
CarouselApp::~CarouselApp()
{
    DestructMachine();
}

#pragma mark -

void CarouselApp::onInitView()
{
    //Resources
    createResources();

    //Configure Nodes
    configureNodes();

    mInitialized = true;
}

void CarouselApp::onResizeView(const tDimension2f& newSize)
{
#pragma unused(newSize)
}

void CarouselApp::onRedrawView(float time)
{
#pragma unused(time)

    //os.init.clearBuffers
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    //os.draw.setTexture
    mWhiteboardTexture->MakeCurrent();

    //os.draw.setTextureParameterState
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    //os.draw.draw
    glDrawArrays(GL_TRIANGLES, 0, (int32_t)mWhiteBoardVerts.size());

    //os.draw.flush
    glFlush();
}

#pragma mark -

void CarouselApp::refresh(const int32_t& newID)
{
    if (mSpots[mSpotFinger]->getID() == newID)
    {
        delete mWhiteboardTexture;
        mWhiteboardTexture = new tTexture(*mMapping[mSpots[mSpotFinger]->getID()]->getSurface());
    }
}

#pragma mark -

void CarouselApp::onAddSpot(const std::string& newType, const int32_t& newID)
{
    if (newType.compare("whiteBoard") == 0)
    {
        WhiteboardSpot* newSpot = new WhiteboardSpot(newID);
        bool wasEmpty = mSpots.empty();

        mSpots.push_back(newSpot);
        mMapping[newID] = newSpot;

        if (wasEmpty)
        {
            process(kShowWhiteboard);
        }
    }
}

void CarouselApp::onRemoveSpot(const int32_t& newID)
{
    std::vector<Spot*>::iterator iter = mSpots.begin();
    uint32_t count = 0;

    while(iter != mSpots.end())
    {
        if ((*iter)->getID() == newID) break;
        count++;
        iter++;
    }

    if (iter != mSpots.end())
    {
        mSpots.erase(iter);
    }

    if (mSpots.empty())
    {
        process(kShowBlank);
    }
    else if (mSpotFinger == count)
    {
        if (mSpotFinger > 0)
        {
            mSpotFinger--;
        }

        process(kShowWhiteboard);
    }
}

void CarouselApp::onOkayButton()
{
    process(kOkay);
}

void CarouselApp::onPrevButton()
{
    sendStrings();
    if (!mSpots.empty())
    {
        if (mSpotFinger != 0)
        {
            mSpotFinger--;
        }
        else
        {
            mSpotFinger = mSpots.size() - 1;
        }
        process(kShowWhiteboard);
    }
}

void CarouselApp::onNextButton()
{
    sendStrings();
    if (!mSpots.empty())
    {
        if (mSpotFinger != mSpots.size() - 1)
        {
            mSpotFinger++;
        }
        else
        {
            mSpotFinger = 0;
        }
        process(kShowWhiteboard);
    }
}

void CarouselApp::onPenSizeChange(const float& newSize)
{
    sendStrings();
    mSendPenSize = newSize;
}

void CarouselApp::onPenColorChange()
{
    sendStrings();
    if (mSendPenColor == kBlack)
    {
        mSendPenColor = kRed;
    }
    else if (mSendPenColor == kRed)
    {
        mSendPenColor = kBlue;
    }
    else if (mSendPenColor == kBlue)
    {
        mSendPenColor = kOrange;
    }
    else if (mSendPenColor == kOrange)
    {
        mSendPenColor = kBlack;
    }
    else
    {
        mSendPenColor = kBlue;
    }
}

void CarouselApp::onEraseButton()
{
    sendStrings();
    mSendPenColor = kWhite;
}

#pragma mark -

/*
 Sample raw JSON we send for strokes:

 [{\"name\":\"save\",\"settings\":{\"colorName\":\"dontcare\",\"lineWidth\":\"%d\",\"strokeStyle\":\"%s\",\"lineJoin\":\"round\"}},{\"name\":\"beginPath\"},{\"name\":\"moveTo\",\"x\":%d,\"y\":%d},{\"name\":\"lineTo\",\"x\":%d,\"y\":%d},{\"name\":\"stroke\"},{\"name\":\"restore\"}]
 */

void CarouselApp::queueLine(const int32_t& newID, const tColor4b& newColor, const int32_t& newPenSize, const tPoint2f& newSt, const tPoint2f& newEn)
{
#pragma unused(newID, newColor, newPenSize)
    char buf[128];

    if (mJSONStrings.empty())
    {
        sprintf(buf, "{\"name\":\"moveTo\",\"x\":%d,\"y\":%d},", (int)newSt.x, (int)newSt.y);
        mJSONStrings.append(std::string(buf));
    }

    sprintf(buf, "{\"name\":\"lineTo\",\"x\":%d,\"y\":%d},", (int)newEn.x, (int)newEn.y);
    mJSONStrings.append(std::string(buf));
}

void CarouselApp::sendStrings()
{
    if (!mJSONStrings.empty())
    {
        char preamble[256];
        sprintf(preamble, "[{\"name\":\"save\",\"settings\":{\"colorName\":\"dontcare\",\"lineWidth\":\"%d\",\"strokeStyle\":\"%s\",\"lineJoin\":\"round\"}},{\"name\":\"beginPath\"},",
                (mSendPenColor == kWhite) ? 30 : (int)mSendPenSize,
                colorToString(mSendPenColor).c_str());
        const char* post = "{\"name\":\"stroke\"},{\"name\":\"restore\"}]";

        [gWebViewInstance stringByEvaluatingJavaScriptFromString:[NSString
                                                                  stringWithFormat:@"Callcast.SendSingleStroke({stroke: '%s%s%s', spotnumber: %d});",
                                                                  preamble, mJSONStrings.c_str(), post, mSpots[mSpotFinger]->getID()]];
        mJSONStrings.clear();
    }
}

#pragma mark -

void CarouselApp::onMouseDown(const tPoint2f& newPt)
{
    tPoint2f lastMousePt = tPoint2f(float(int32_t(newPt.x)), float(int32_t(newPt.y)));

    mShouldCapture = true;
    mStartTouch     = lastMousePt;
    mLastPolledPt   = lastMousePt;
}

void CarouselApp::onMouseDrag(const tPoint2f& newPt)
{
    mLastPolledPt = tPoint2f(float(int32_t(newPt.x)), float(int32_t(newPt.y)));
}

void CarouselApp::onMouseUp(const tPoint2f& newPt)
{
    mEndTouch   = tPoint2f(float(int32_t(newPt.x)), float(int32_t(newPt.y)));

    queueLine(mSpots[mSpotFinger]->getID(), mSendPenColor, (mSendPenColor == kWhite) ? 30 : (int)mSendPenSize, mStartTouch, mLastPolledPt);

    sendStrings();

    mShouldCapture = false;
}

void CarouselApp::onTimerTick(const tTimer* newTimer)
{
#pragma unused(newTimer)

    if (newTimer == mInputTimer && mShouldCapture)
    {
        if (mLastPolledPt != mStartTouch)
        {
            queueLine(mSpots[mSpotFinger]->getID(), mSendPenColor, (mSendPenColor == kWhite) ? 30 : (int)mSendPenSize, mStartTouch, mLastPolledPt);

            mStartTouch = mLastPolledPt;
        }
    }
    else if (newTimer == mJSONTimer)
    {
        if (!mJSONStrings.empty())
        {
            sendStrings();
        }
    }
}

#pragma mark -

void CarouselApp::startEntry()
{
    tSGView::getInstance()->attach(this);
    tInputManager::getInstance()->tSubject<const tTouchEvent&>::attach(this);
    CarouselEventManager::getInstance()->tSubject<const CallcastEvent&>::attach(this);

    mInputTimer = new tTimerPeer(60);
    mInputTimer->attach(this);
    mInputTimer->start();

    mJSONTimer = new tTimerPeer(600);
    mJSONTimer->attach(this);
    mJSONTimer->start();
}

void CarouselApp::startExit() { }

void CarouselApp::endEntry()
{
    if (mJSONTimer) delete mJSONTimer;
    if (mInputTimer) delete mInputTimer;
    if (mSpriteProgram) delete mSpriteProgram;
}
void CarouselApp::endExit() { }

void CarouselApp::showWebLoadingViewEntry()
{
    [gAppDelegateInstance showWebLoadingView];
}
void CarouselApp::showWebLoadingViewExit()
{
    [gAppDelegateInstance hideWebLoadingView];
}

void CarouselApp::showLoginViewEntry()
{
    [gAppDelegateInstance showLoginView];
}

void CarouselApp::showLoginViewExit()
{
    [gAppDelegateInstance hideLoginView];

    [gWebViewInstance stringByEvaluatingJavaScriptFromString: [NSString stringWithFormat:@"startCallcast('%s','%s')", mNickname.c_str(), mRoomname.c_str()]];
}

void CarouselApp::showBlankSpotEntry()
{
    [gAppDelegateInstance showBlankSpot];
}

void CarouselApp::showBlankSpotExit()
{
    [gAppDelegateInstance hideBlankSpot];
}

void CarouselApp::showNicknameInUseEntry()
{
    [gAppDelegateInstance showNicknameInUse];
}

void CarouselApp::showNicknameInUseExit()
{
    [gAppDelegateInstance hideNicknameInUse];
}

void CarouselApp::showLoggingInViewEntry()
{
    [gAppDelegateInstance showLoggingInView];
}

void CarouselApp::showLoggingInViewExit()
{
    [gAppDelegateInstance hideLoggingInView];
}

void CarouselApp::showWhiteboardSpotEntry()
{
    if (mInitialized)
    {
        if (!mMapping.empty())
        {
            delete mWhiteboardTexture;
            mWhiteboardTexture = new tTexture(*mMapping[mSpots[mSpotFinger]->getID()]->getSurface());
        }
    }
    [gAppDelegateInstance showWhiteboardSpot];
}

void CarouselApp::showWhiteboardSpotExit()
{
    [gAppDelegateInstance hideWhiteboardSpot];
}

void CarouselApp::update(const CarouselAppMessage& msg)
{
    process(msg.event);
}

void CarouselApp::update(const CallcastEvent& msg)
{
    switch (msg.mEvent)
    {
        case CallcastEvent::kAddSpot: onAddSpot(msg.mSpotType, msg.mSpotID); break;
        case CallcastEvent::kRemoveSpot: onRemoveSpot(msg.mSpotID); break;

        case CallcastEvent::kWebViewLoaded:     process(CarouselApp::kWebViewLoaded); break;
        case CallcastEvent::kSubmitLogin:
            mNickname = msg.mNickname;
            mRoomname = msg.mRoomname;
            process(CarouselApp::kLoginPressed);
            break;
        case CallcastEvent::kLoggedIn:          process(CarouselApp::kLoginSuccess); break;
        case CallcastEvent::kOnNicknameInUse:   process(CarouselApp::kNickInUse); break;
        default: break;
    }
}

void CarouselApp::update(const tSGViewEvent& msg)
{
    switch (msg.event)
    {
        case tSGViewEvent::kInitView:    onInitView(); break;
        case tSGViewEvent::kResizeView:  onResizeView(msg.size); break;
        case tSGViewEvent::kRedrawView:  onRedrawView(msg.drawTime); break;

        default: break;
    }
}

void CarouselApp::update(const tTimerEvent& msg)
{
    switch (msg.mEvent)
    {
        case tTimer::kTimerTick: onTimerTick(msg.mTimer); break;

        default: break;
    }
}

void CarouselApp::update(const tTouchEvent& msg)
{
    switch (msg.event)
    {
        case tTouchEvent::kTouchBegin:  onMouseDown(msg.location); break;
        case tTouchEvent::kTouchDrag:   onMouseDrag(msg.location); break;
        case tTouchEvent::kTouchEnd:    onMouseUp(msg.location); break;

        default:
            break;
    }
}

