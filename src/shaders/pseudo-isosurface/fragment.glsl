precision highp float;
precision highp sampler3D;

in vec3 oTexCoords;

uniform sampler3D uVolumeTexture;
uniform vec3 u_cameraPosition;
uniform vec3 u_stepSize;
uniform float u_isoValue;

const int MAX_SAMPLES = 300;
const vec3 texMin = vec3(0.0);
const vec3 texMax = vec3(1.0);
const float DELTA = 0.01;

layout(location = 0) out vec4 FragColor;

vec3 BiSection(vec3 left,vec3 right,float iso)
{
    for(int i=0;i<4;i++)
    {
        // get mid value betwn left and right:
        vec3 midpoint = (left+right)*0.5;
        //sample texture at mid value:
        float cMid = texture(uVolumeTexture,midpoint).x;
        // compare value at middle with isoValue
        if(cMid <iso)
            left=midpoint;
        else
            right = midpoint;
    }
    // return middle point betwn left and right limit:
    return (vec3(left+right)*0.5);
}

vec3 GetGradient(vec3 uvW)
{
    vec3 s1,s2;

    // use center finitie different:
    s1.x = texture(uVolumeTexture, uvW-vec3(DELTA,0.0,0.0)).x ;
    s2.x = texture(uVolumeTexture, uvW+vec3(DELTA,0.0,0.0)).x ;

    s1.y = texture(uVolumeTexture, uvW-vec3(0.0,DELTA,0.0)).x ;
    s2.y = texture(uVolumeTexture, uvW+vec3(0.0,DELTA,0.0)).x ;

    s1.z = texture(uVolumeTexture, uvW-vec3(0.0,0.0,DELTA)).x ;
    s2.z = texture(uVolumeTexture, uvW+vec3(0.0,0.0,DELTA)).x ;
    
    return (normalize((s1-s2)/2.0));         
}

vec4 PhongLighting(vec3 L, vec3 N, vec3 V, float specPower, vec3 diffuseColor)
{
    float diffuse = max(dot(L,N),0.0);
    vec3 halfVec = normalize(L+V);
    float specular = pow(max(0.00001,dot(halfVec,N)),specPower);	
    return vec4((diffuse*diffuseColor + specular),1.0);
}

void main()
{
    float isoValue = u_isoValue/255.0;

    // Step 1: Initial 3D texture position.
    vec3 dataPosition = oTexCoords;

    // Step 2: Calculate ray marching direction.
    vec3 geometryDirection = normalize((oTexCoords - vec3(0.5)) - u_cameraPosition);

    // Step 3: Calculate the incremental step.
    vec3 directionStep = geometryDirection * u_stepSize;

    for (int i = 0; i < MAX_SAMPLES; i++)
    {
        dataPosition += directionStep;

        // Stop if the position is outside the volume.
        bool bStop =dot(sign(dataPosition - texMin),sign(texMax - dataPosition)) < 3.0;

        if (bStop)
            break;

        // Sample the red channel of the 3D texture.
        float fSample = texture(uVolumeTexture, dataPosition).r;
        float fSample2 = texture(uVolumeTexture, dataPosition+directionStep).r;

        if((fSample - isoValue) < 0.0 && (fSample2 - isoValue) >= 0.0)
        {
            //If there is a zero crossing, we refine the detected iso-surface location by using bisection based refinement.
            vec3 xN = dataPosition;
            vec3 xF = dataPosition + directionStep;
            vec3 tc = BiSection(xN,xF,isoValue);

            //This returns the first hit surface //vFragColor = make_float4(xN,1);
            
            //To get the shaded iso-surface, we first estimate the normal at the refined position
            vec3 N = GetGradient(tc);					

            //The view vector is simply opposite to the ray marching direction
            vec3 V = -geometryDirection;

            //We keep the view vector as the light vector to give us a head light
            vec3 L =  V;

            //Finally, we call PhongLighing function to get the final colour with diffuse and specular components. Try changing this call to this
            //vFragColor =  PhongLighting(L,N,V,250,  tc); to get a multi colour
            //iso-surface
            FragColor =  PhongLighting(L,N,V,250.0, vec3(0.5));	
            break;
        }
    }

}

