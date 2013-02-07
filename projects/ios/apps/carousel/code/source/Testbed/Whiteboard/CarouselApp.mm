#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

#include "CarouselApp.h"

#include "AppDelegate.h"

const tDimension2f  kSurfaceSize(500,500);
const tDimension2f  kSpotSize(300,300);

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
    surface.fillRect(tRectf(0,0,surface.getSize()), tColor4b(255,255,255,255));
    surface.drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));

    mWhiteboardTexture = new tTexture(surface);

    mWhiteBoardVerts        = sixPoints(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height));
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

        static tMatrix4x4f orthoProj = ortho(0,kSurfaceSize.width, kSurfaceSize.height, 0);
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
		mSpriteProgram->AddAttrib(location);	// Remember that we added this

        glVertexAttribPointer(location, 2, GL_FLOAT, GL_TRUE, 0, &mWhiteBoardVerts[0]);
    }

    //os.draw.setTexCoords
    {
        GLuint location = (GLuint)glGetAttribLocation(mSpriteProgram->mProgramID, "mTexCoords");
        assert((GLint)location != -1);

        glEnableVertexAttribArray(location);
		mSpriteProgram->AddAttrib(location);	// Remember that we added this

        glVertexAttribPointer(location, 2, GL_FLOAT, GL_TRUE, 0, &mWhiteBoardTexCoords[0]);
    }
    
}

CarouselApp::CarouselApp()
:   //mWhiteboardSurface(tPixelFormat::kR8G8B8A8, kSurfaceSize),
    mSpriteProgram(NULL),
    mWhiteboardTexture(NULL),
    mNickname("nick"),
    mRoomname("room"),
    mSpotFinger(0),
    mInitialized(false)
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

static tPoint2f lastMousePt = tPoint2f(0,0);

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

void CarouselApp::onAddSpot(const std::string& newType, const int32_t& newID)
{
    if (newType.compare("whiteBoard") == 0)
    {
        bool wasEmpty = mSpots.empty();

        mSpots.push_back(newID);

        tSurface* surface = new tSurface(tPixelFormat::kR8G8B8A8, kSurfaceSize);
        surface->fillRect(tRectf(0,0,surface->getSize()), tColor4b(255,255,255,255));
        surface->drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));

        mSurfaces[newID] = surface;

        if (wasEmpty)
        {
            if (mInitialized)
            {
                delete mWhiteboardTexture;
                mWhiteboardTexture = new tTexture(*(*mSurfaces.begin()).second);
            }

            process(kShowWhiteboard);
        }
    }
}

void CarouselApp::onRemoveSpot(const int32_t& newID)
{
    std::list<int32_t>::iterator iter = mSpots.begin();
    uint32_t count = 0;

    while(iter != mSpots.end())
    {
        if (*iter == newID) break;
        count++;
        iter++;
    }

    if (iter != mSpots.end())
    {
        delete mSurfaces[newID];
        mSurfaces.erase(newID);
        mSpots.erase(iter);
    }

    if (mSpots.empty())
    {
        process(kShowBlank);
    }
    else if (mSpotFinger == count)
    {
        process(kShowWhiteboard);
    }
}

void CarouselApp::onOkayButton()
{
    process(kOkay);
}

void CarouselApp::onPrevButton()
{
    if (mSpotFinger != 0)
    {
        mSpotFinger--;
        process(kShowWhiteboard);
    }
}

void CarouselApp::onNextButton()
{
    if (mSpotFinger != mSpots.size() - 1)
    {
        mSpotFinger++;
        process(kShowWhiteboard);
    }
}

#pragma mark -

void CarouselApp::onSave(const tColor4b& nc, const float& np)
{
    mReceivePenColor    = nc;
    mReceivePenSize     = np;
}

void CarouselApp::onMoveTo(const tPoint2f& pt)
{
    mCurDrawPoint = pt;
}

void CarouselApp::onLineTo(const tPoint2f& pt)
{
    if (!mSurfaces.empty())
    {
        (*mSurfaces.begin()).second->drawLineWithPen(mCurDrawPoint, pt, mReceivePenColor, mReceivePenSize);
    }

    mCurDrawPoint = pt;
}

void CarouselApp::onStroke()
{
    if (!mSurfaces.empty())
    {
        delete mWhiteboardTexture;
        mWhiteboardTexture = new tTexture(*(*mSurfaces.begin()).second);
    }
}

#pragma mark -

void CarouselApp::startEntry()
{
    tSGView::getInstance()->attach(this);
    CallcastManager::getInstance()->attach(this);
}

void CarouselApp::startExit() { }

void CarouselApp::endEntry() { }
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
        case CallcastEvent::kSave:   onSave(msg.mColor, msg.mPenSize); break;
        case CallcastEvent::kMoveTo: onMoveTo(msg.mPoint); break;
        case CallcastEvent::kLineTo: onLineTo(msg.mPoint); break;
        case CallcastEvent::kStroke: onStroke(); break;

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

