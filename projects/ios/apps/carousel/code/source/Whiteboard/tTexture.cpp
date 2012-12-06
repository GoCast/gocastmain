#include "package.h"

static float log2(const float &x)
{
    return float(logf(x) / 0.6931471805599453f);
}

static float roundPow2(const float &x)
{
    if (x > 0)
    {
        return 1 << uint32_t(log2(float(x - 1)) + 1);
    }

    return 1;
}


void tTexture::MakeCurrent()
{
    glBindTexture(GL_TEXTURE_2D, textureID);
}

void tTexture::MakeSurfaceCopyUpsideDown(tSurface& dst, const tSurface& src)
{
    tPoint2f index;

    for(index.y = 0; index.y < src.getSize().height; index.y++)
    {
        for (index.x = 0; index.x < src.getSize().width; index.x++)
        {
            dst.setPixel(tPoint2f(index.x, dst.getSize().height - (1 + index.y)), src.getPixel(index));
        }
    }
}

tTexture::tTexture(const tSurface& newSurface)
{
    //TODO: optimize this-- we're potentially doing a copy operation we don't need to do in most cases.
    tSurface s1(tPixelFormat::kR8G8B8A8, tDimension2f(roundPow2(newSurface.getSize().width), roundPow2(newSurface.getSize().height)));

    s1.fillRect(tRectf(tPoint2f(0,0), s1.getSize()), tColor4b(0,0,0,0));
    MakeSurfaceCopyUpsideDown(s1, newSurface);
//    s1.copyRect(newSurface, tRectf(tPoint2f(0,0), newSurface.getSize()), tPoint2f(0,0));

    mTextureSize = s1.mSize;

    glGenTextures(1, &textureID);

    assert(textureID != 0);

    glBindTexture (GL_TEXTURE_2D, textureID);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_NEAREST);

    switch (s1.mType)
    {
        case tPixelFormat::kR8G8B8A8:   glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGBA, (GLsizei)s1.mSize.width, (GLsizei)s1.mSize.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, s1.mPtr); break;
        case tPixelFormat::kR8G8B8:     glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGB, (GLsizei)s1.mSize.width, (GLsizei)s1.mSize.height, 0, GL_RGB, GL_UNSIGNED_BYTE, s1.mPtr); break;

        default:
            tSurface compatibleSurface(tPixelFormat::kR8G8B8A8, s1);
            glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGBA,
                         (GLsizei)compatibleSurface.mSize.width, (GLsizei)compatibleSurface.mSize.height,
                         0, GL_RGBA, GL_UNSIGNED_BYTE, compatibleSurface.mPtr);
            break;
    }

    glBindTexture(GL_TEXTURE_2D, 0);
}

tTexture::~tTexture()
{
    glDeleteTextures(1, &textureID);
}

tDimension2f tTexture::getSize() const
{
    return mTextureSize;
}
