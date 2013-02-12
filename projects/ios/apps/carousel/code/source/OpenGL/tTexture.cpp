#include "Base/package.h"
#include "Math/package.h"
#include "OpenGL/package.h"

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

void tTexture::MakeSurfaceCopy(tSurface& dst, const tSurface& src)
{
    printf("*** MakeSurfaceCopy\n");
    if ((dst.mBytesPerRow == src.mBytesPerRow) &&
        (dst.mSize == src.mSize) &&
        (dst.mType == src.mType))
    {
        memcpy(dst.mPtr, src.mPtr, dst.mBytesPerRow * (uint32_t)dst.mSize.height);
    }
    else if (dst.mBytesPerRow >= src.mBytesPerRow)
    {
        uint32_t minHeight = std::min((uint32_t)src.mSize.height, (uint32_t)dst.mSize.height);
        uint32_t minBytesPerRow = std::min((uint32_t)src.mBytesPerRow, (uint32_t)dst.mBytesPerRow);

        for(uint32_t y = 0; y < minHeight; y++)
        {
            memcpy(&dst.mPtr[y * dst.mBytesPerRow], &src.mPtr[y * src.mBytesPerRow], minBytesPerRow);
        }
    }
    else
    {
        tPoint2f index;

        for(index.y = 0; index.y < src.getSize().height; index.y++)
        {
            for (index.x = 0; index.x < src.getSize().width; index.x++)
            {
                dst.setPixel(tPoint2f(index.x, index.y), src.getPixel(index));
            }
        }
    }
}

void tTexture::CreateFromSurface(const tSurface& newSurface)
{
    float pow2Width     = roundPow2(newSurface.getSize().width);
    float pow2Height    = roundPow2(newSurface.getSize().height);
    bool isPow2         =   (newSurface.getSize().width     == pow2Width) &&
                            (newSurface.getSize().height    == pow2Height);

    if (!isPow2)
    {
        tSurface s1(tPixelFormat::kR8G8B8A8, tDimension2f(roundPow2(newSurface.getSize().width), roundPow2(newSurface.getSize().height)));

        MakeSurfaceCopy(s1, newSurface);

        CreateFromSurface(s1);
    }
    else
    {
        mTextureSize = newSurface.mSize;

        glGenTextures(1, &textureID);

        assert(textureID != 0);

        glBindTexture (GL_TEXTURE_2D, textureID);
        glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_NEAREST);

        switch (newSurface.mType)
        {
            case tPixelFormat::kR8G8B8A8:   glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGBA, (GLsizei)newSurface.mSize.width, (GLsizei)newSurface.mSize.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, newSurface.mPtr); break;
            case tPixelFormat::kR8G8B8:     glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGB, (GLsizei)newSurface.mSize.width, (GLsizei)newSurface.mSize.height, 0, GL_RGB, GL_UNSIGNED_BYTE, newSurface.mPtr); break;

            default:
                tSurface compatibleSurface(tPixelFormat::kR8G8B8A8, newSurface);
                glTexImage2D(GL_TEXTURE_2D, 0, (GLint)GL_RGBA,
                             (GLsizei)compatibleSurface.mSize.width, (GLsizei)compatibleSurface.mSize.height,
                             0, GL_RGBA, GL_UNSIGNED_BYTE, compatibleSurface.mPtr);
                break;
        }
        
        glBindTexture(GL_TEXTURE_2D, 0);
    }
}

tTexture::tTexture(const tSurface& newSurface)
{
    CreateFromSurface(newSurface);
}

tTexture::~tTexture()
{
    glDeleteTextures(1, &textureID);
}

tDimension2f tTexture::getSize() const
{
    return mTextureSize;
}
