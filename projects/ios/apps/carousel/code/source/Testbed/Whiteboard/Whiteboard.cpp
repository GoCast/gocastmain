#include "Base/package.h"
#include "Math/package.h"
#include "Input/package.h"
#include "Io/package.h"
#include "OpenGL/package.h"
#include "Whiteboard.h"

class tMatrix4x4f
{
public:
    float mArray[4][4];

public:
    tMatrix4x4f(const float& d)
    {
        mArray[0][0] = d; mArray[0][1] = 0; mArray[0][2] = 0; mArray[0][3] = 0;
        mArray[1][0] = 0; mArray[1][1] = d; mArray[1][2] = 0; mArray[1][3] = 0;
        mArray[2][0] = 0; mArray[2][1] = 0; mArray[2][2] = d; mArray[2][3] = 0;
        mArray[3][0] = 0; mArray[3][1] = 0; mArray[3][2] = 0; mArray[3][3] = d;
    }
};

static tMatrix4x4f ortho(const float &left, const float &right, const float &bottom, const float &top)
{
    tMatrix4x4f Result(1);

    Result.mArray[0][0] = float(2) / (right - left);
    Result.mArray[1][1] = float(2) / (top - bottom);
    Result.mArray[2][2] = - float(1);
    Result.mArray[3][0] = - (right + left) / (right - left);
    Result.mArray[3][1] = - (top + bottom) / (top - bottom);

    return Result;
}

const tDimension2f kScreenSize(320,480);

Whiteboard gApp;

Whiteboard::Whiteboard()
:   mWhiteboardSurface(tPixelFormat::kR8G8B8A8, kScreenSize),
    mWhiteboardTexture(NULL),
    mMouseTexture(NULL),
    mSpriteProgram(NULL)
{
    tSGView::getInstance()->attach(this);
    tInputManager::getInstance()->tSubject<const tMouseEvent&>::attach(this);
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
    mouse.fillRect(tRectf(0,0,mouse.getSize()), tColor4b(0,0,255,255));

    mMouseTexture = new tTexture(mouse);
    mWhiteboardTexture = new tTexture(mWhiteboardSurface);
}

//Create Nodes
//void Whiteboard::createNodes()
//{
//    tSG_CREATE("os.root.tag", new tSGNode);
//
//    //os.init.tag
//    tSG_CREATE("os.init.tag",                   new tSGNode);
//    tSG_CREATE("os.init.setFrameBufferState",   new tSGSetFrameBufferStateNode);
//    tSG_CREATE("os.init.clearBuffers",          new tSGClearBuffersNode(tSGClearBuffersNode::kColorBufferBit | tSGClearBuffersNode::kDepthBufferBit));
//    tSG_CREATE("os.init.setBlendState",         new tSGSetBlendStateNode);
//    tSG_CREATE("os.init.setDepthState",         new tSGSetDepthStateNode);
//    tSG_CREATE("os.init.setRasterState",        new tSGSetRasterizerStateNode);
//
//    //os.draw.tag
//    tSG_CREATE("os.draw.tag",                       new tSGNode);
//    tSG_CREATE("os.draw.setViewportState",          new tSGSetViewportStateNode);
//    tSG_CREATE("os.draw.setProgram",                new tSGSetProgramNode);
//    tSG_CREATE("os.draw.setProjection",             new tSGSetUniformNode("mProjection"));
//    tSG_CREATE("os.draw.draw",                      new tSGDrawSorted2DNode);
//    tSG_CREATE("os.draw.flush",                     new tSGFlushNode);
//}

//Link Nodes
//void Whiteboard::linkNodes()
//{
////    tSGView::getInstance()->setRootNode(tSG_RETRIEVE("os.root.tag", tSGNode));
//
//    //os.root.tag
//    tSG_LINK("os.root.tag", "os.init.tag");
//    tSG_LINK("os.root.tag", "os.draw.tag");
//
//    //os.init.tag
//    tSG_LINK("os.init.tag",                 "os.init.setFrameBufferState");
//    tSG_LINK("os.init.setFrameBufferState", "os.init.clearBuffers");
//    tSG_LINK("os.init.clearBuffers",        "os.init.setBlendState");
//    tSG_LINK("os.init.setBlendState",       "os.init.setDepthState");
//    tSG_LINK("os.init.setDepthState",       "os.init.setRasterState");
//
//    //os.draw.tag
//    tSG_LINK("os.draw.tag",                 "os.draw.setViewportState");
//    tSG_LINK("os.draw.setViewportState",    "os.draw.setProgram");
//    tSG_LINK("os.draw.setProgram",          "os.draw.setProjection");
//    tSG_LINK("os.draw.setProgram",          "os.draw.draw");
//    tSG_LINK("os.draw.draw",                "os.draw.flush");
//}

//Configure Nodes
void Whiteboard::configureNodes()
{
//    tSG_RETRIEVE("os.init.setFrameBufferState", tSGSetFrameBufferStateNode)->setClearColor(tColor4f(0,0,0,1));
//    tSG_RETRIEVE("os.init.setBlendState", tSGSetBlendStateNode)->setBlendEnabled(true);
//    tSG_RETRIEVE("os.init.setBlendState", tSGSetBlendStateNode)->setBlendFunc(tSGSetBlendStateNode::kSourceAlpha, tSGSetBlendStateNode::kOneMinusSourceAlpha);
//    tSG_RETRIEVE("os.init.setDepthState", tSGSetDepthStateNode)->setDepthTestEnabled(false);
//    tSG_RETRIEVE("os.init.setRasterState", tSGSetRasterizerStateNode)->setCullFaceEnabled(false);
//
//    tSG_RETRIEVE("os.draw.setViewportState", tSGSetViewportStateNode)->setViewport(tRect<tSInt32>(0,0,(tSInt32)kScreenSize.width,(tSInt32)kScreenSize.height));
//    tSG_RETRIEVE("os.draw.setProgram", tSGSetProgramNode)->setProgramPtr(tProgramCache::getInstance()->retrieve("spritesheet.prog"));
//    tSG_RETRIEVE("os.draw.setProjection", tSGSetUniformNode)->setUniform(tMatrix4x4f::ortho(0,kScreenSize.width,kScreenSize.height, 0));
}

void Whiteboard::onInitView()
{
    //Resources
    createResources();

    //Configure Nodes
    configureNodes();
}

void Whiteboard::onResizeView(const tDimension2f& newSize)
{
#pragma unused(newSize)
}

static tPoint2f lastMousePt = tPoint2f(0,0);

void Whiteboard::onRedrawView(float time)
{
#pragma unused(time)

    //os.root.tag
    //os.init.tag
    //os.init.setFrameBufferState
    glClearColor(0,0,0,1);
    glClearDepth(1);
    glClearStencil(0);

    //os.init.clearBuffers
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    //os.init.setBlendState
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    //os.init.setDepthState
    glDisable(GL_DEPTH_TEST);

    //os.init.setRasterState
    glDisable(GL_CULL_FACE);

    //os.draw.tag
    //os.draw.setViewportState
    glDepthRange(0, 1);
    glViewport(0, 0, (int32_t)kScreenSize.width, (int32_t)kScreenSize.height);

    //os.draw.setProgram
    mSpriteProgram->setActive();
    //os.draw.setProjection
    {
        GLint location;

        location = glGetUniformLocation(mSpriteProgram->mProgramID, "mProjection");
        assert(location != -1);

        tMatrix4x4f orthoProj = ortho(0, 0, kScreenSize.width, kScreenSize.height);
        glUniformMatrix4fv(location, 1, false, &orthoProj.mArray[0][0]);
    }
    //os.draw.draw
    //os.draw.flush
    glFlush();

//    tSGDrawSorted2DNode* ssNode = tSG_RETRIEVE("os.draw.draw", tSGDrawSorted2DNode);
//
//    tSG_RETRIEVE("os.draw.draw", tSGDrawSorted2DNode)->add(tSGSpriteSheet(tRectf(0,0,kScreenSize.width,kScreenSize.height), kScreenSize).generateSprite(tTextureCache::getInstance()->retrieve("mWhiteboardSurface")->getSize(), 0), tPoint2f(0,0), tTextureCache::getInstance()->retrieve("mWhiteboardSurface"), 0);
//
//    ssNode->add(tSGSpriteSheet(tRectf(0,0,32,32), tDimension2f(32,32)).generateSprite(tTextureCache::getInstance()->retrieve("mouse")->getSize(), 0), lastMousePt, tTextureCache::getInstance()->retrieve("mouse"), 255);
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
        case tMouseEvent::kMouseDrag:
            mWhiteboardSurface.fillRect(tRectf(lastMousePt - tPoint2f(2,2), tDimension2f(4,4)), tColor4b(0,0,255,255));
            break;

        case tMouseEvent::kMouseUp:
            delete mWhiteboardTexture;
            mWhiteboardTexture = new tTexture(mWhiteboardSurface);
            break;

        default:
            break;
    }
}
