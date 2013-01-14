#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"
#include "Whiteboard.h"

#include "CallcastEvent.h"
#include "CallcastManager.h"

class tVector4f
{
public:
    union
    {
        float mArray[4];
        struct { float x, y, z, w; };
    };

    //Array subscript operator
	float& operator [](const size_t i) { assert(i < 4); return mArray[i]; }
	const float& operator [](const size_t i) const { assert(i < 4); return mArray[i]; }

public:
    tVector4f(const float& nx = 0, const float& ny = 0, const float& nz = 0, const float& nw = 0)
    : x(nx), y(ny), z(nz), w(nw) { }
};

class tMatrix4x4f
{
public:
    tVector4f mArray[4];

	tVector4f& operator [](const size_t i) { assert(i < 4); return mArray[i]; }
	const tVector4f& operator [](const size_t i) const { assert(i < 4); return mArray[i]; }

public:
    tMatrix4x4f(const float& n)
    {
        mArray[0] = tVector4f(n, 0, 0, 0);
        mArray[1] = tVector4f(0, n, 0, 0);
        mArray[2] = tVector4f(0, 0, n, 0);
        mArray[3] = tVector4f(0, 0, 0, n);
    }
};

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

const tDimension2f  kSurfaceSize(500,500);
const tDimension2f  kSpotSize(300,300);

const tColor4b      kBlack  (0,0,0,255);
const tColor4b      kRed    (255,0,0,255);
const tColor4b      kBlue   (0,0,255,255);
const tColor4b      kOrange (255,165,0,255);
const tColor4b      kWhite  (255,255,255,255);

Whiteboard gApp;

Whiteboard::Whiteboard()
:   mWhiteboardSurface(tPixelFormat::kR8G8B8A8, kSurfaceSize),
    mWhiteboardTexture(NULL),
    mMouseTexture(NULL),
    mSpriteProgram(NULL),
    mReceivePenColor(kBlue),
    mReceivePenSize(5),
    mSendPenColor(kBlue),
    mSendPenSize(5),
    mInitialized(false)
{
    tSGView::getInstance()->attach(this);
    tInputManager::getInstance()->tSubject<const tMouseEvent&>::attach(this);
    CallcastManager::getInstance()->attach(this);
}

Whiteboard::~Whiteboard()
{
    if (mSpriteProgram) delete mSpriteProgram;
    if (mMouseTexture) delete mMouseTexture;
    if (mWhiteboardTexture) delete mWhiteboardTexture;
}

//Resources
void Whiteboard::createResources()
{
    mSpriteProgram = new tProgram(tShader(tShader::kVertexShader,    tFile::fileToString("spritesheet.vert")),
                                  tShader(tShader::kFragmentShader,  tFile::fileToString("spritesheet.frag")));

    tSurface mouse(tPixelFormat::kR8G8B8A8, tDimension2f(32,32));

    mWhiteboardSurface.fillRect(tRectf(0,0,mWhiteboardSurface.getSize()), tColor4b(255,255,255,255));
    mWhiteboardSurface.drawLine(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height), tColor4b(255,0,0,255));
    mouse.fillRect(tRectf(0,0,mouse.getSize()), tColor4b(0,0,255,255));

    mMouseTexture = new tTexture(mouse);
    mWhiteboardTexture = new tTexture(mWhiteboardSurface);
    
    mWhiteBoardVerts        = sixPoints(tPoint2f(0,0), tPoint2f(kSurfaceSize.width, kSurfaceSize.height));
    mWhiteBoardTexCoords    = sixPoints(tPoint2f(0,0), tPoint2f(kSurfaceSize.width / mWhiteboardTexture->getSize().width, kSurfaceSize.height / mWhiteboardTexture->getSize().height));
}

//Configure Nodes
void Whiteboard::configureNodes()
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

void Whiteboard::onInitView()
{
    //Resources
    createResources();

    //Configure Nodes
    configureNodes();

    mInitialized = true;
}

void Whiteboard::onResizeView(const tDimension2f& newSize)
{
#pragma unused(newSize)
}

static tPoint2f lastMousePt = tPoint2f(0,0);

void Whiteboard::onRedrawView(float time)
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

void Whiteboard::onSave(const tColor4b& nc, const float& np)
{
    mReceivePenColor    = nc;
    mReceivePenSize     = np;
}

void Whiteboard::onMoveTo(const tPoint2f& pt)
{
    mCurDrawPoint = pt;
}

void Whiteboard::onLineTo(const tPoint2f& pt)
{
    mWhiteboardSurface.drawLineWithPen(mCurDrawPoint, pt, mReceivePenColor, mReceivePenSize);

    mCurDrawPoint = pt;
}

void Whiteboard::onStroke()
{
    delete mWhiteboardTexture;
    mWhiteboardTexture = new tTexture(mWhiteboardSurface);
}


void Whiteboard::update(const tSGViewEvent& msg)
{
    switch (msg.event)
    {
        case tSGViewEvent::kInitView:    onInitView(); break;
        case tSGViewEvent::kResizeView:  onResizeView(msg.size); break;
        case tSGViewEvent::kRedrawView:  onRedrawView(msg.drawTime); break;

        default: break;
    }
}

void Whiteboard::update(const tMouseEvent& msg)
{
    lastMousePt = tPoint2f(float(int32_t(msg.location.x)), float(int32_t(msg.location.y)));

    switch (msg.event)
    {
        case tMouseEvent::kMouseDown:
            mStartTouch = lastMousePt;
            break;
        case tMouseEvent::kMouseDrag:
//            mWhiteboardSurface.fillRect(tRectf(lastMousePt - tPoint2f(2,2), tDimension2f(4,4)), tColor4b(0,0,255,255));
            break;

        case tMouseEvent::kMouseUp:
            mEndTouch   = lastMousePt;

            mWhiteboardSurface.drawLineWithPen(mStartTouch, mEndTouch, mSendPenColor, mSendPenSize);

            delete mWhiteboardTexture;
            mWhiteboardTexture = new tTexture(mWhiteboardSurface);
            break;

        default:
            break;
    }
}

void Whiteboard::update(const CallcastEvent& msg)
{
    if (mInitialized)
    {
        switch (msg.mEvent)
        {
            case CallcastEvent::kSave:   onSave(msg.mColor, msg.mPenSize); break;
            case CallcastEvent::kMoveTo: onMoveTo(msg.mPoint); break;
            case CallcastEvent::kLineTo: onLineTo(msg.mPoint); break;
            case CallcastEvent::kStroke: onStroke(); break;

            default: break;
        }
    }
}

