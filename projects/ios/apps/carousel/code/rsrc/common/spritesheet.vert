#version 120

uniform mat4 mProjection;
uniform vec2 mToPoint;

varying vec2 texCoords;

attribute vec2 mVerts;
attribute vec2 mTexCoords;

void main()
{
	gl_Position = mProjection * vec4(mVerts + mToPoint, 0.0, 1.0);

    texCoords = vec2(mTexCoords.x, 1.0f - mTexCoords.y);
}

