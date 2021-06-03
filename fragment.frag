precision mediump float;
uniform sampler2D u_texture;
uniform float iTime;
uniform vec2 resolution;
varying vec3 vpos;
uniform vec3 ipos;
/*void main() {
  // just grab the middle pixel(s) from the texture
  // but swizzle the colors g->r, b->g, r->b
  gl_FragColor = vec4(vpos.x,vpos.y,sin(time/10.),1);//texture2D(u_texture, vec2(.5)).gbra;
}*/

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01


float sdCapsule(vec3 p,vec3 a, vec3 b, float r){
    //float v=floor(sin(p.x*4.)*2.)*(1.+cos(iTime));//floor(sin(p.x*2.)*4.)*2;
    vec3 offset=vec3(0,0,0);//+vec3(round(1.*abs(cos(iTime+p.x*2.))),0,0);
    a+=offset;
    b+=offset;
    vec3 ab=b-a;
    vec3 ap=p-a;
    float t = dot(ab,ap) / length(ab);//dot(ab,ab);
    t=clamp(t,0.,1.);
    vec3 c = a+ t*ab;
    return length(p-c) -r;
}

float sdSphere(vec3 p,vec3 a, float r){
return length(p-a) - r;
}
float sdTorus(vec3 p,vec2 r){
    float x=length(p.xz)-r.x;
    return length(vec2(x,p.y)) - r.y;
}

float getDist(vec3 p){
    
    vec3 a=vec3(cos((p.y+iTime)*2.)/8.,sin(p.y*3.+iTime*3.)*2.,6); //vec3(0,1,4);//
    a.x+=ipos.x;
    a.y*=ipos.y;
    a.y+=1.*(ipos.y+1.5);
    vec3 b=vec3(0,2.,4);
    float sphereD=sdSphere(p,a,1.);
   // float torusD=sdTorus(p-vec3(0,0,5),vec2(1.5,.5));
    float planeDist=p.y;
    float d=min(sphereD,planeDist);
    //d=min(d,torusD);
    return d;
}

float rayMarch(vec3 ro, vec3 rd){
    float dO=0.;
    for(int i=0;i<MAX_STEPS;i++){
        vec3 p = ro +rd*dO;
        float dS =getDist(p);
        dO+=dS;
        if(dO>MAX_DIST || dS<SURF_DIST)break;
    }
    return dO;
}

vec3 getNormal(vec3 p){
    float dist=getDist(p);
    vec2 e=vec2(0.01,0);
    vec3 n = dist - vec3(getDist(p-e.xyy),getDist(p-e.yxy),getDist(p-e.yyx));
    return normalize(n);
}

float getLight(vec3 p){
    vec3 lightPos=vec3(cos(iTime)*3.,5,0); // 0 5 6 
    vec3 l =normalize(lightPos-p);
    vec3 n = getNormal(p);
    float diff=clamp(dot(l,n),0.,1.);
    float dist=rayMarch(p+n*SURF_DIST*3.,l);
    if(dist<length(lightPos -p)) diff*=0.6;
    return diff;
}

void main(){
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (vpos.xy*resolution.xy)/resolution.y;
    
    //camera
    vec3 ro=vec3(cos(iTime),1,sin(iTime));
       //ray diff
    vec3 rd=normalize(vec3(uv.x,uv.y,1));
    
    float dist=rayMarch(ro,rd);
    
    vec3 point = ro +rd*dist;
    float diffuse= getLight(point);

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
    //col=vec3(dist);
    /*if(diffuse!=0.){
      col=vec3(diffuse);
    }*/
    col=mix(col/2.,vec3(1),vec3(diffuse));
    

    // Output to screen
    gl_FragColor = vec4(col,1.0);
}