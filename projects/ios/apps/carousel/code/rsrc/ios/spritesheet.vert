uniform highp mat4 mProjection;
uniform highp vec2 mToPoint;

varying highp vec2 texCoords;

attribute highp vec2 mVerts;
attribute highp vec2 mTexCoords;

void main()
{
	gl_Position = mProjection * vec4(mVerts + mToPoint, 0.0, 1.0);

    texCoords = vec2(mTexCoords.x, 1.0 - mTexCoords.y);
}

