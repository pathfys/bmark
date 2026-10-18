nt.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(n){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),h=o(e.shapes),p=o(e.skeletons),m=o(e.animations),y=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),d.length>0&&(i.images=d),h.length>0&&(i.shapes=h),p.length>0&&(i.skeletons=p),m.length>0&&(i.animations=m),y.length>0&&(i.nodes=y)}return i.object=r,i;function o(a){const l=[];for(const c in a){const d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}fn.DEFAULT_UP=new ce(0,1,0);fn.DEFAULT_MATRIX_AUTO_UPDATE=!0;fn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const _s=new ce,So=new ce,I_=new ce,bo=new ce,vu=new ce,xu=new ce,WC=new ce,k_=new ce,L_=new ce,U_=new ce,B_=new cn,N_=new cn,D_=new cn;class vr{constructor(e=new ce,n=new ce,i=new ce){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),_s.subVectors(e,n),r.cross(_s);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){_s.subVectors(r,n),So.subVectors(i,n),I_.subVectors(e,n);const o=_s.dot(_s),a=_s.dot(So),l=_s.dot(I_),c=So.dot(So),d=So.dot(I_),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const p=1/h,m=(c*l-a*d)*p,y=(o*d-a*l)*p;return s.set(1-m-y,y,m)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,bo)===null?!1:bo.x>=0&&bo.y>=0&&bo.x+bo.y<=1}static getInterpolation(e,n,i,r,s,o,a,l){return this.getBarycoord(e,n,i,r,bo)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,bo.x),l.addScaledVector(o,bo.y),l.addScaledVector(a,bo.z),l)}static getInterpolatedAttribute(e,n,i,r,s,o){return B_.setScalar(0),N_.setScalar(0),D_.setScalar(0),B_.fromBufferAttribute(e,n),N_.fromBufferAttribute(e,i),D_.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(B_,s.x),o.addScaledVector(N_,s.y),o.addScaledVector(D_,s.z),o}static isFrontFacing(e,n,i,r){return _s.subVectors(i,n),So.subVectors(e,n),_s.cross(So).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _s.subVectors(this.c,this.b),So.subVectors(this.a,this.b),_s.cross(So).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return vr.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return vr.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return vr.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return vr.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return vr.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let o,a;vu.subVectors(r,i),xu.subVectors(s,i),k_.subVectors(e,i);const l=vu.dot(k_),c=xu.dot(k_);if(l<=0&&c<=0)return n.copy(i);L_.subVectors(e,r);const d=vu.dot(L_),h=xu.dot(L_);if(d>=0&&h<=d)return n.copy(r);const p=l*h-d*c;if(p<=0&&l>=0&&d<=0)return o=l/(l-d),n.copy(i).addScaledVector(vu,o);U_.subVectors(e,s);const m=vu.dot(U_),y=xu.dot(U_);if(y>=0&&m<=y)return n.copy(s);const S=m*c-l*y;if(S<=0&&c>=0&&y<=0)return a=c/(c-y),n.copy(i).addScaledVector(xu,a);const x=d*y-m*h;if(x<=0&&h-d>=0&&m-y>=0)return WC.subVectors(s,r),a=(h-d)/(h-d+(m-y)),n.copy(r).addScaledVector(WC,a);const g=1/(x+S+p);return o=S*g,a=p*g,n.copy(i).addScaledVector(vu,o).addScaledVector(xu,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const iL={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ua={h:0,s:0,l:0},Sg={h:0,s:0,l:0};function O_(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Pt{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=gr){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,mn.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=mn.workingColorSpace){return this.r=e,this.g=n,this.b=i,mn.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=mn.workingColorSpace){if(e=y2(e,1),n=Qn(n,0,1),i=Qn(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,o=2*i-s;this.r=O_(o,s,e+1/3),this.g=O_(o,s,e),this.b=O_(o,s,e-1/3)}return mn.toWorkingColorSpace(this,r),this}setStyle(e,n=gr){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=gr){const i=iL[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=df(e.r),this.g=df(e.g),this.b=df(e.b),this}copyLinearToSRGB(e){return this.r=S_(e.r),this.g=S_(e.g),this.b=S_(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=gr){return mn.fromWorkingColorSpace(Vi.copy(this),e),Math.round(Qn(Vi.r*255,0,255))*65536+Math.round(Qn(Vi.g*255,0,255))*256+Math.round(Qn(Vi.b*255,0,255))}getHexString(e=gr){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=mn.workingColorSpace){mn.fromWorkingColorSpace(Vi.copy(this),n);const i=Vi.r,r=Vi.g,s=Vi.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let l,c;const d=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=d<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,n=mn.workingColorSpace){return mn.fromWorkingColorSpace(Vi.copy(this),n),e.r=Vi.r,e.g=Vi.g,e.b=Vi.b,e}getStyle(e=gr){mn.fromWorkingColorSpace(Vi.copy(this),e);const n=Vi.r,i=Vi.g,r=Vi.b;return e!==gr?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(ua),this.setHSL(ua.h+e,ua.s+n,ua.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(ua),e.getHSL(Sg);const i=kh(ua.h,Sg.h,n),r=kh(ua.s,Sg.s,n),s=kh(ua.l,Sg.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Vi=new Pt;Pt.NAMES=iL;let kj=0;class Li extends uo{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:kj++}),this.uuid=zr(),this.name="",this.type="Material",this.blending=ic,this.side=Yo,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=dy,this.blendDst=hy,this.blendEquation=ba,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Pt(0,0,0),this.blendAlpha=0,this.depthFunc=hc,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=$S,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vl,this.stencilZFail=Vl,this.stencilZPass=Vl,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ic&&(i.blending=this.blending),this.side!==Yo&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==dy&&(i.blendSrc=this.blendSrc),this.blendDst!==hy&&(i.blendDst=this.blendDst),this.blendEquation!==ba&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==hc&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==$S&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vl&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Vl&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Vl&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(n){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ko extends Li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wr,this.combine=Np,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Io=Lj();function Lj(){const t=new ArrayBuffer(4),e=new Float32Array(t),n=new Uint32Array(t),i=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,r[l]=24,r[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,r[l]=-c-1,r[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,r[l]=13,r[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,r[l]=24,r[l|256]=24):(i[l]=31744,i[l|256]=64512,r[l]=13,r[l|256]=13)}const s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,d=0;for(;!(c&8388608);)c<<=1,d-=8388608;c&=-8388609,d+=947912704,s[l]=c|d}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:n,baseTable:i,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function mr(t){Math.abs(t)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),t=Qn(t,-65504,65504),Io.floatView[0]=t;const e=Io.uint32View[0],n=e>>23&511;return Io.baseTable[n]+((e&8388607)>>Io.shiftTable[n])}function ch(t){const e=t>>10;return Io.uint32View[0]=Io.mantissaTable[Io.offsetTable[e]+(t&1023)]+Io.exponentTable[e],Io.floatView[0]}const Zl={toHalfFloat:mr,fromHalfFloat:ch},fi=new ce,bg=new at;class Sn{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=up,this.updateRanges=[],this.gpuType=jn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)bg.fromBufferAttribute(this,n),bg.applyMatrix3(e),this.setXY(n,bg.x,bg.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)fi.fromBufferAttribute(this,n),fi.applyMatrix3(e),this.setXYZ(n,fi.x,fi.y,fi.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)fi.fromBufferAttribute(this,n),fi.applyMatrix4(e),this.setXYZ(n,fi.x,fi.y,fi.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)fi.fromBufferAttribute(this,n),fi.applyNormalMatrix(e),this.setXYZ(n,fi.x,fi.y,fi.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)fi.fromBufferAttribute(this,n),fi.transformDirection(e),this.setXYZ(n,fi.x,fi.y,fi.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=nr(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Jt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=nr(n,this.array)),n}setX(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=nr(n,this.array)),n}setY(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=nr(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=nr(n,this.array)),n}setW(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array),r=Jt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array),r=Jt(r,this.array),s=Jt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==up&&(e.usage=this.usage),e}}class Uj extends Sn{constructor(e,n,i){super(new Int8Array(e),n,i)}}class Bj extends Sn{constructor(e,n,i){super(new Uint8Array(e),n,i)}}class Nj extends Sn{constructor(e,n,i){super(new Uint8ClampedArray(e),n,i)}}class Dj extends Sn{constructor(e,n,i){super(new Int16Array(e),n,i)}}class x2 extends Sn{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class Oj extends Sn{constructor(e,n,i){super(new Int32Array(e),n,i)}}class _2 extends Sn{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class zj extends Sn{constructor(e,n,i){super(new Uint16Array(e),n,i),this.isFloat16BufferAttribute=!0}getX(e){let n=ch(this.array[e*this.itemSize]);return this.normalized&&(n=nr(n,this.array)),n}setX(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize]=mr(n),this}getY(e){let n=ch(this.array[e*this.itemSize+1]);return this.normalized&&(n=nr(n,this.array)),n}setY(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+1]=mr(n),this}getZ(e){let n=ch(this.array[e*this.itemSize+2]);return this.normalized&&(n=nr(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+2]=mr(n),this}getW(e){let n=ch(this.array[e*this.itemSize+3]);return this.normalized&&(n=nr(n,this.array)),n}setW(e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[e*this.itemSize+3]=mr(n),this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array)),this.array[e+0]=mr(n),this.array[e+1]=mr(i),this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array),r=Jt(r,this.array)),this.array[e+0]=mr(n),this.array[e+1]=mr(i),this.array[e+2]=mr(r),this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Jt(n,this.array),i=Jt(i,this.array),r=Jt(r,this.array),s=Jt(s,this.array)),this.array[e+0]=mr(n),this.array[e+1]=mr(i),this.array[e+2]=mr(r),this.array[e+3]=mr(s),this}}class Bt extends Sn{constructor(e,n,i){super(new Float32Array(e),n,i)}}let Fj=0;const is=new Wt,z_=new fn,_u=new ce,Ur=new or,Ld=new or,Si=new ce;class en extends uo{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Fj++}),this.uuid=zr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Q6(e)?_2:x2)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Zt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return is.makeRotationFromQuaternion(e),this.applyMatrix4(is),this}rotateX(e){return is.makeRotationX(e),this.applyMatrix4(is),this}rotateY(e){return is.makeRotationY(e),this.applyMatrix4(is),this}rotateZ(e){return is.makeRotationZ(e),this.applyMatrix4(is),this}translate(e,n,i){return is.makeTranslation(e,n,i),this.applyMatrix4(is),this}scale(e,n,i){return is.makeScale(e,n,i),this.applyMatrix4(is),this}lookAt(e){return z_.lookAt(e),z_.updateMatrix(),this.applyMatrix4(z_.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(_u).negate(),this.translate(_u.x,_u.y,_u.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Bt(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new or);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ce(-1/0,-1/0,-1/0),new ce(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];Ur.setFromBufferAttribute(s),this.morphTargetsRelative?(Si.addVectors(this.boundingBox.min,Ur.min),this.boundingBox.expandByPoint(Si),Si.addVectors(this.boundingBox.max,Ur.max),this.boundingBox.expandByPoint(Si)):(this.boundingBox.expandByPoint(Ur.min),this.boundingBox.expandByPoint(Ur.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qi);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ce,1/0);return}if(e){const i=this.boundingSphere.center;if(Ur.setFromBufferAttribute(e),n)for(let s=0,o=n.length;s<o;s++){const a=n[s];Ld.setFromBufferAttribute(a),this.morphTargetsRelative?(Si.addVectors(Ur.min,Ld.min),Ur.expandByPoint(Si),Si.addVectors(Ur.max,Ld.max),Ur.expandByPoint(Si)):(Ur.expandByPoint(Ld.min),Ur.expandByPoint(Ld.max))}Ur.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Si.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Si));if(n)for(let s=0,o=n.length;s<o;s++){const a=n[s],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)Si.fromBufferAttribute(a,c),l&&(_u.fromBufferAttribute(e,c),Si.add(_u)),r=Math.max(r,i.distanceToSquared(Si))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Sn(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let O=0;O<i.count;O++)a[O]=new ce,l[O]=new ce;const c=new ce,d=new ce,h=new ce,p=new at,m=new at,y=new at,S=new ce,x=new ce;function g(O,Q,I){c.fromBufferAttribute(i,O),d.fromBufferAttribute(i,Q),h.fromBufferAttribute(i,I),p.fromBufferAttribute(s,O),m.fromBufferAttribute(s,Q),y.fromBufferAttribute(s,I),d.sub(c),h.sub(c),m.sub(p),y.sub(p);const F=1/(m.x*y.y-y.x*m.y);isFinite(F)&&(S.copy(d).multiplyScalar(y.y).addScaledVector(h,-m.y).multiplyScalar(F),x.copy(h).multiplyScalar(m.x).addScaledVector(d,-y.x).multiplyScalar(F),a[O].add(S),a[Q].add(S),a[I].add(S),l[O].add(x),l[Q].add(x),l[I].add(x))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let O=0,Q=_.length;O<Q;++O){const I=_[O],F=I.start,ge=I.count;for(let J=F,W=F+ge;J<W;J+=3)g(e.getX(J+0),e.getX(J+1),e.getX(J+2))}const w=new ce,T=new ce,N=new ce,L=new ce;function B(O){N.fromBufferAttribute(r,O),L.copy(N);const Q=a[O];w.copy(Q),w.sub(N.multiplyScalar(N.dot(Q))).normalize(),T.crossVectors(L,Q);const F=T.dot(l[O])<0?-1:1;o.setXYZW(O,w.x,w.y,w.z,F)}for(let O=0,Q=_.length;O<Q;++O){const I=_[O],F=I.start,ge=I.count;for(let J=F,W=F+ge;J<W;J+=3)B(e.getX(J+0)),B(e.getX(J+1)),B(e.getX(J+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Sn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let p=0,m=i.count;p<m;p++)i.setXYZ(p,0,0,0);const r=new ce,s=new ce,o=new ce,a=new ce,l=new ce,c=new ce,d=new ce,h=new ce;if(e)for(let p=0,m=e.count;p<m;p+=3){const y=e.getX(p+0),S=e.getX(p+1),x=e.getX(p+2);r.fromBufferAttribute(n,y),s.fromBufferAttribute(n,S),o.fromBufferAttribute(n,x),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),a.fromBufferAttribute(i,y),l.fromBufferAttribute(i,S),c.fromBufferAttribute(i,x),a.add(d),l.add(d),c.add(d),i.setXYZ(y,a.x,a.y,a.z),i.setXYZ(S,l.x,l.y,l.z),i.setXYZ(x,c.x,c.y,c.z)}else for(let p=0,m=n.count;p<m;p+=3)r.fromBufferAttribute(n,p+0),s.fromBufferAttribute(n,p+1),o.fromBufferAttribute(n,p+2),d.subVectors(o,s),h.subVectors(r,s),d.cross(h),i.setXYZ(p+0,d.x,d.y,d.z),i.setXYZ(p+1,d.x,d.y,d.z),i.setXYZ(p+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Si.fromBufferAttribute(e,n),Si.normalize(),e.setXYZ(n,Si.x,Si.y,Si.z)}toNonIndexed(){function e(a,l){const c=a.array,d=a.itemSize,h=a.normalized,p=new c.constructor(l.length*d);let m=0,y=0;for(let S=0,x=l.length;S<x;S++){a.isInterleavedBufferAttribute?m=l[S]*a.data.stride+a.offset:m=l[S]*d;for(let g=0;g<d;g++)p[y++]=c[m++]}return new Sn(p,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new en,i=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,i);n.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let d=0,h=c.length;d<h;d++){const p=c[d],m=e(p,i);l.push(m)}n.morphAttributes[a]=l}n.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let h=0,p=c.length;h<p;h++){const m=c[h];d.push(m.toJSON(e.data))}d.length>0&&(r[l]=d,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(n))}const s=e.morphAttributes;for(const c in s){const d=[],h=s[c];for(let p=0,m=h.length;p<m;p++)d.push(h[p].clone(n));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,d=o.length;c<d;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const GC=new Wt,wl=new Wf,Mg=new qi,XC=new ce,Eg=new ce,Tg=new ce,Ag=new ce,F_=new ce,Cg=new ce,qC=new ce,Pg=new ce;class Wn extends fn{constructor(e=new en,n=new Ko){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){Cg.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const d=a[l],h=s[l];d!==0&&(F_.fromBufferAttribute(h,e),o?Cg.addScaledVector(F_,d):Cg.addScaledVector(F_.sub(n),d))}n.add(Cg)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Mg.copy(i.boundingSphere),Mg.applyMatrix4(s),wl.copy(e.ray).recast(e.near),!(Mg.containsPoint(wl.origin)===!1&&(wl.intersectSphere(Mg,XC)===null||wl.origin.distanceToSquared(XC)>(e.far-e.near)**2))&&(GC.copy(s).invert(),wl.copy(e.ray).applyMatrix4(GC),!(i.boundingBox!==null&&wl.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,wl)))}_computeIntersections(e,n,i){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,d=s.attributes.uv1,h=s.attributes.normal,p=s.groups,m=s.drawRange;if(a!==null)if(Array.isArray(o))for(let y=0,S=p.length;y<S;y++){const x=p[y],g=o[x.materialIndex],_=Math.max(x.start,m.start),w=Math.min(a.count,Math.min(x.start+x.count,m.start+m.count));for(let T=_,N=w;T<N;T+=3){const L=a.getX(T),B=a.getX(T+1),O=a.getX(T+2);r=Rg(this,g,e,i,c,d,h,L,B,O),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=x.materialIndex,n.push(r))}}else{const y=Math.max(0,m.start),S=Math.min(a.count,m.start+m.count);for(let x=y,g=S;x<g;x+=3){const _=a.getX(x),w=a.getX(x+1),T=a.getX(x+2);r=Rg(this,o,e,i,c,d,h,_,w,T),r&&(r.faceIndex=Math.floor(x/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let y=0,S=p.length;y<S;y++){const x=p[y],g=o[x.materialIndex],_=Math.max(x.start,m.start),w=Math.min(l.count,Math.min(x.start+x.count,m.start+m.count));for(let T=_,N=w;T<N;T+=3){const L=T,B=T+1,O=T+2;r=Rg(this,g,e,i,c,d,h,L,B,O),r&&(r.faceIndex=Math.floor(T/3),r.face.materialIndex=x.materialIndex,n.push(r))}}else{const y=Math.max(0,m.start),S=Math.min(l.count,m.start+m.count);for(let x=y,g=S;x<g;x+=3){const _=x,w=x+1,T=x+2;r=Rg(this,o,e,i,c,d,h,_,w,T),r&&(r.faceIndex=Math.floor(x/3),n.push(r))}}}}function Vj(t,e,n,i,r,s,o,a){let l;if(e.side===sr?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===Yo,a),l===null)return null;Pg.copy(a),Pg.applyMatrix4(t.matrixWorld);const c=n.ray.origin.distanceTo(Pg);return c<n.near||c>n.far?null:{distance:c,point:Pg.clone(),object:t}}function Rg(t,e,n,i,r,s,o,a,l,c){t.getVertexPosition(a,Eg),t.getVertexPosition(l,Tg),t.getVertexPosition(c,Ag);const d=Vj(t,e,n,i,Eg,Tg,Ag,qC);if(d){const h=new ce;vr.getBarycoord(qC,Eg,Tg,Ag,h),r&&(d.uv=vr.getInterpolatedAttribute(r,a,l,c,h,new at)),s&&(d.uv1=vr.getInterpolatedAttribute(s,a,l,c,h,new at)),o&&(d.normal=vr.getInterpolatedAttribute(o,a,l,c,h,new ce),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new ce,materialIndex:0};vr.getNormal(Eg,Tg,Ag,p.normal),d.face=p,d.barycoord=h}return d}class Gc extends en{constructor(e=1,n=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],d=[],h=[];let p=0,m=0;y("z","y","x",-1,-1,i,n,e,o,s,0),y("z","y","x",1,-1,i,n,-e,o,s,1),y("x","z","y",1,1,e,i,n,r,o,2),y("x","z","y",1,-1,e,i,-n,r,o,3),y("x","y","z",1,-1,e,n,i,r,s,4),y("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Bt(c,3)),this.setAttribute("normal",new Bt(d,3)),this.setAttribute("uv",new Bt(h,2));function y(S,x,g,_,w,T,N,L,B,O,Q){const I=T/B,F=N/O,ge=T/2,J=N/2,W=L/2,ve=B+1,le=O+1;let ke=0,ee=0;const $=new ce;for(let _e=0;_e<le;_e++){const Ce=_e*F-J;for(let Ye=0;Ye<ve;Ye++){const ct=Ye*I-ge;$[S]=ct*_,$[x]=Ce*w,$[g]=W,c.push($.x,$.y,$.z),$[S]=0,$[x]=0,$[g]=L>0?1:-1,d.push($.x,$.y,$.z),h.push(Ye/B),h.push(1-_e/O),ke+=1}}for(let _e=0;_e<O;_e++)for(let Ce=0;Ce<B;Ce++){const Ye=p+Ce+ve*_e,ct=p+Ce+ve*(_e+1),De=p+(Ce+1)+ve*(_e+1),je=p+(Ce+1)+ve*_e;l.push(Ye,ct,je),l.push(ct,De,je),ee+=6}a.addGroup(m,ee,Q),m+=ee,p+=ke}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gc(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Cf(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Qi(t){const e={};for(let n=0;n<t.length;n++){const i=Cf(t[n]);for(const r in i)e[r]=i[r]}return e}function Hj(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function rL(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:mn.workingColorSpace}const sL={clone:Cf,merge:Qi};var jj=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Wj=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Er extends Li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jj,this.fragmentShader=Wj,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Cf(e.uniforms),this.uniformsGroups=Hj(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?n.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[r]={type:"m4",value:o.toArray()}:n.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class Vp extends fn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Wt,this.projectionMatrix=new Wt,this.projectionMatrixInverse=new Wt,this.coordinateSystem=$s}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const fa=new ce,YC=new at,$C=new at;class Mi extends Vp{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Af*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(sc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Af*2*Math.atan(Math.tan(sc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){fa.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fa.x,fa.y).multiplyScalar(-e/fa.z),fa.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(fa.x,fa.y).multiplyScalar(-e/fa.z)}getViewSize(e,n){return this.getViewBounds(e,YC,$C),n.subVectors($C,YC)}setViewOffset(e,n,i,r,s,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(sc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,n-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const wu=-90,Su=1;class oL extends fn{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Mi(wu,Su,e,n);r.layers=this.layers,this.add(r);const s=new Mi(wu,Su,e,n);s.layers=this.layers,this.add(s);const o=new Mi(wu,Su,e,n);o.layers=this.layers,this.add(o);const a=new Mi(wu,Su,e,n);a.layers=this.layers,this.add(a);const l=new Mi(wu,Su,e,n);l.layers=this.layers,this.add(l);const c=new Mi(wu,Su,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,o,a,l]=n;for(const c of n)this.remove(c);if(e===$s)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===fp)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,d]=this.children,h=e.getRenderTarget(),p=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;const S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,o),e.setRenderTarget(i,2,r),e.render(n,a),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=S,e.setRenderTarget(i,5,r),e.render(n,d),e.setRenderTarget(h,p,m),e.xr.enabled=y,i.texture.needsPMREMUpdate=!0}}class Hp extends yn{constructor(e,n,i,r,s,o,a,l,c,d){e=e!==void 0?e:[],n=n!==void 0?n:oo,super(e,n,i,r,s,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class w2 extends jr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Hp(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:gn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Gc(5,5,5),s=new Er({name:"CubemapFromEquirect",uniforms:Cf(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:sr,blending:no});s.uniforms.tEquirect.value=n;const o=new Wn(r,s),a=n.minFilter;return n.minFilter===Ys&&(n.minFilter=gn),new oL(1,10,this).update(e,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,r);e.setRenderTarget(s)}}const V_=new ce,Gj=new ce,Xj=new Zt;class _a{constructor(e=new ce(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=V_.subVectors(i,n).cross(Gj.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(V_),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||Xj.getNormalMatrix(e),r=this.coplanarPoint(V_).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Sl=new qi,Ig=new ce;class jp{constructor(e=new _a,n=new _a,i=new _a,r=new _a,s=new _a,o=new _a){this.planes=[e,n,i,r,s,o]}set(e,n,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(n),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=$s){const i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],d=r[5],h=r[6],p=r[7],m=r[8],y=r[9],S=r[10],x=r[11],g=r[12],_=r[13],w=r[14],T=r[15];if(i[0].setComponents(l-s,p-c,x-m,T-g).normalize(),i[1].setComponents(l+s,p+c,x+m,T+g).normalize(),i[2].setComponents(l+o,p+d,x+y,T+_).normalize(),i[3].setComponents(l-o,p-d,x-y,T-_).normalize(),i[4].setComponents(l-a,p-h,x-S,T-w).normalize(),n===$s)i[5].setComponents(l+a,p+h,x+S,T+w).normalize();else if(n===fp)i[5].setComponents(a,h,S,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Sl.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),Sl.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Sl)}intersectsSprite(e){return Sl.center.set(0,0,0),Sl.radius=.7071067811865476,Sl.applyMatrix4(e.matrixWorld),this.intersectsSphere(Sl)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(Ig.x=r.normal.x>0?e.max.x:e.min.x,Ig.y=r.normal.y>0?e.max.y:e.min.y,Ig.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ig)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function aL(){let t=null,e=!1,n=null,i=null;function r(s,o){n(s,o),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function qj(t){const e=new WeakMap;function n(a,l){const c=a.array,d=a.usage,h=c.byteLength,p=t.createBuffer();t.bindBuffer(l,p),t.bufferData(l,c,d),a.onUploadCallback();let m;if(c instanceof Float32Array)m=t.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?m=t.HALF_FLOAT:m=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=t.SHORT;else if(c instanceof Uint32Array)m=t.UNSIGNED_INT;else if(c instanceof Int32Array)m=t.INT;else if(c instanceof Int8Array)m=t.BYTE;else if(c instanceof Uint8Array)m=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){const d=l.array,h=l.updateRanges;if(t.bindBuffer(c,a),h.length===0)t.bufferSubData(c,0,d);else{h.sort((m,y)=>m.start-y.start);let p=0;for(let m=1;m<h.length;m++){const y=h[p],S=h[m];S.start<=y.start+y.count+1?y.count=Math.max(y.count,S.start+S.count-y.start):(++p,h[p]=S)}h.length=p+1;for(let m=0,y=h.length;m<y;m++){const S=h[m];t.bufferSubData(c,S.start*d.BYTES_PER_ELEMENT,d,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(t.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,n(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class rl extends en{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,o=n/2,a=Math.floor(i),l=Math.floor(r),c=a+1,d=l+1,h=e/a,p=n/l,m=[],y=[],S=[],x=[];for(let g=0;g<d;g++){const _=g*p-o;for(let w=0;w<c;w++){const T=w*h-s;y.push(T,-_,0),S.push(0,0,1),x.push(w/a),x.push(1-g/l)}}for(let g=0;g<l;g++)for(let _=0;_<a;_++){const w=_+c*g,T=_+c*(g+1),N=_+1+c*(g+1),L=_+1+c*g;m.push(w,T,L),m.push(T,N,L)}this.setIndex(m),this.setAttribute("position",new Bt(y,3)),this.setAttribute("normal",new Bt(S,3)),this.setAttribute("uv",new Bt(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new rl(e.width,e.height,e.widthSegments,e.heightSegments)}}var Yj=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,$j=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Kj=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Zj=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jj=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Qj=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,eW=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tW=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,nW=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,iW=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,rW=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,sW=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,oW=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,aW=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,lW=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cW=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,uW=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,fW=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,dW=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hW=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,pW=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,mW=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,gW=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,yW=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,vW=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,xW=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,_W=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wW=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,SW=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bW=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,MW="gl_FragColor = linearToOutputTexel( gl_FragColor );",EW=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,TW=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,AW=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,CW=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,PW=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,RW=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,IW=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,kW=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,LW=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,UW=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,BW=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,NW=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,DW=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,OW=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,zW=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,FW=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,VW=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,HW=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,jW=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,WW=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,GW=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,XW=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,qW=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,YW=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,$W=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,KW=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ZW=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,JW=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,QW=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,eG=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tG=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,nG=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,iG=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rG=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sG=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,oG=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,aG=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,lG=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,cG=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,uG=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fG=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,dG=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,hG=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pG=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mG=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,gG=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,yG=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vG=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,xG=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_G=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,wG=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,SG=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,bG=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,MG=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,EG=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,TG=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,AG=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,CG=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,PG=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,RG=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,IG=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,kG=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,LG=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,UG=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,BG=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,NG=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,DG=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,OG=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,zG=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,FG=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,VG=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,HG=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,jG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,WG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,GG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,XG=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const qG=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,YG=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$G=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,KG=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ZG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,JG=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,QG=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,eX=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tX=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,nX=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,iX=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,rX=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sX=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,oX=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,aX=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,lX=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cX=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,uX=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fX=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,dX=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hX=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,pX=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,mX=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gX=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yX=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,vX=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xX=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_X=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wX=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,SX=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,bX=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,MX=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,EX=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,TX=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qt={alphahash_fragment:Yj,alphahash_pars_fragment:$j,alphamap_fragment:Kj,alphamap_pars_fragment:Zj,alphatest_fragment:Jj,alphatest_pars_fragment:Qj,aomap_fragment:eW,aomap_pars_fragment:tW,batching_pars_vertex:nW,batching_vertex:iW,begin_vertex:rW,beginnormal_vertex:sW,bsdfs:oW,iridescence_fragment:aW,bumpmap_pars_fragment:lW,clipping_planes_fragment:cW,clipping_planes_pars_fragment:uW,clipping_planes_pars_vertex:fW,clipping_planes_vertex:dW,color_fragment:hW,color_pars_fragment:pW,color_pars_vertex:mW,color_vertex:gW,common:yW,cube_uv_reflection_fragment:vW,defaultnormal_vertex:xW,displacementmap_pars_vertex:_W,displacementmap_vertex:wW,emissivemap_fragment:SW,emissivemap_pars_fragment:bW,colorspace_fragment:MW,colorspace_pars_fragment:EW,envmap_fragment:TW,envmap_common_pars_fragment:AW,envmap_pars_fragment:CW,envmap_pars_vertex:PW,envmap_physical_pars_fragment:FW,envmap_vertex:RW,fog_vertex:IW,fog_pars_vertex:kW,fog_fragment:LW,fog_pars_fragment:UW,gradientmap_pars_fragment:BW,lightmap_pars_fragment:NW,lights_lambert_fragment:DW,lights_lambert_pars_fragment:OW,lights_pars_begin:zW,lights_toon_fragment:VW,lights_toon_pars_fragment:HW,lights_phong_fragment:jW,lights_phong_pars_fragment:WW,lights_physical_fragment:GW,lights_physical_pars_fragment:XW,lights_fragment_begin:qW,lights_fragment_maps:YW,lights_fragment_end:$W,logdepthbuf_fragment:KW,logdepthbuf_pars_fragment:ZW,logdepthbuf_pars_vertex:JW,logdepthbuf_vertex:QW,map_fragment:eG,map_pars_fragment:tG,map_particle_fragment:nG,map_particle_pars_fragment:iG,metalnessmap_fragment:rG,metalnessmap_pars_fragment:sG,morphinstance_vertex:oG,morphcolor_vertex:aG,morphnormal_vertex:lG,morphtarget_pars_vertex:cG,morphtarget_vertex:uG,normal_fragment_begin:fG,normal_fragment_maps:dG,normal_pars_fragment:hG,normal_pars_vertex:pG,normal_vertex:mG,normalmap_pars_fragment:gG,clearcoat_normal_fragment_begin:yG,clearcoat_normal_fragment_maps:vG,clearcoat_pars_fragment:xG,iridescence_pars_fragment:_G,opaque_fragment:wG,packing:SG,premultiplied_alpha_fragment:bG,project_vertex:MG,dithering_fragment:EG,dithering_pars_fragment:TG,roughnessmap_fragment:AG,roughnessmap_pars_fragment:CG,shadowmap_pars_fragment:PG,shadowmap_pars_vertex:RG,shadowmap_vertex:IG,shadowmask_pars_fragment:kG,skinbase_vertex:LG,skinning_pars_vertex:UG,skinning_vertex:BG,skinnormal_vertex:NG,specularmap_fragment:DG,specularmap_pars_fragment:OG,tonemapping_fragment:zG,tonemapping_pars_fragment:FG,transmission_fragment:VG,transmission_pars_fragment:HG,uv_pars_fragment:jG,uv_pars_vertex:WG,uv_vertex:GG,worldpos_vertex:XG,background_vert:qG,background_frag:YG,backgroundCube_vert:$G,backgroundCube_frag:KG,cube_vert:ZG,cube_frag:JG,depth_vert:QG,depth_frag:eX,distanceRGBA_vert:tX,distanceRGBA_frag:nX,equirect_vert:iX,equirect_frag:rX,linedashed_vert:sX,linedashed_frag:oX,meshbasic_vert:aX,meshbasic_frag:lX,meshlambert_vert:cX,meshlambert_frag:uX,meshmatcap_vert:fX,meshmatcap_frag:dX,meshnormal_vert:hX,meshnormal_frag:pX,meshphong_vert:mX,meshphong_frag:gX,meshphysical_vert:yX,meshphysical_frag:vX,meshtoon_vert:xX,meshtoon_frag:_X,points_vert:wX,points_frag:SX,shadow_vert:bX,shadow_frag:MX,sprite_vert:EX,sprite_frag:TX},St={common:{diffuse:{value:new Pt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Pt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Pt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new Pt(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},As={basic:{uniforms:Qi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.fog]),vertexShader:Qt.meshbasic_vert,fragmentShader:Qt.meshbasic_frag},lambert:{uniforms:Qi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new Pt(0)}}]),vertexShader:Qt.meshlambert_vert,fragmentShader:Qt.meshlambert_frag},phong:{uniforms:Qi([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new Pt(0)},specular:{value:new Pt(1118481)},shininess:{value:30}}]),vertexShader:Qt.meshphong_vert,fragmentShader:Qt.meshphong_frag},standard:{uniforms:Qi([St.common,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.roughnessmap,St.metalnessmap,St.fog,St.lights,{emissive:{value:new Pt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag},toon:{uniforms:Qi([St.common,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.gradientmap,St.fog,St.lights,{emissive:{value:new Pt(0)}}]),vertexShader:Qt.meshtoon_vert,fragmentShader:Qt.meshtoon_frag},matcap:{uniforms:Qi([St.common,St.bumpmap,St.normalmap,St.displacementmap,St.fog,{matcap:{value:null}}]),vertexShader:Qt.meshmatcap_vert,fragmentShader:Qt.meshmatcap_frag},points:{uniforms:Qi([St.points,St.fog]),vertexShader:Qt.points_vert,fragmentShader:Qt.points_frag},dashed:{uniforms:Qi([St.common,St.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qt.linedashed_vert,fragmentShader:Qt.linedashed_frag},depth:{uniforms:Qi([St.common,St.displacementmap]),vertexShader:Qt.depth_vert,fragmentShader:Qt.depth_frag},normal:{uniforms:Qi([St.common,St.bumpmap,St.normalmap,St.displacementmap,{opacity:{value:1}}]),vertexShader:Qt.meshnormal_vert,fragmentShader:Qt.meshnormal_frag},sprite:{uniforms:Qi([St.sprite,St.fog]),vertexShader:Qt.sprite_vert,fragmentShader:Qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qt.background_vert,fragmentShader:Qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:Qt.backgroundCube_vert,fragmentShader:Qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qt.cube_vert,fragmentShader:Qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qt.equirect_vert,fragmentShader:Qt.equirect_frag},distanceRGBA:{uniforms:Qi([St.common,St.displacementmap,{referencePosition:{value:new ce},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qt.distanceRGBA_vert,fragmentShader:Qt.distanceRGBA_frag},shadow:{uniforms:Qi([St.lights,St.fog,{color:{value:new Pt(0)},opacity:{value:1}}]),vertexShader:Qt.shadow_vert,fragmentShader:Qt.shadow_frag}};As.physical={uniforms:Qi([As.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new Pt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new Pt(0)},specularColor:{value:new Pt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag};const kg={r:0,b:0,g:0},bl=new Wr,AX=new Wt;function CX(t,e,n,i,r,s,o){const a=new Pt(0);let l=s===!0?0:1,c,d,h=null,p=0,m=null;function y(_){let w=_.isScene===!0?_.background:null;return w&&w.isTexture&&(w=(_.backgroundBlurriness>0?n:e).get(w)),w}function S(_){let w=!1;const T=y(_);T===null?g(a,l):T&&T.isColor&&(g(T,1),w=!0);const N=t.xr.getEnvironmentBlendMode();N==="additive"?i.buffers.color.setClear(0,0,0,1,o):N==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(t.autoClear||w)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function x(_,w){const T=y(w);T&&(T.isCubeTexture||T.mapping===jf)?(d===void 0&&(d=new Wn(new Gc(1,1,1),new Er({name:"BackgroundCubeMaterial",uniforms:Cf(As.backgroundCube.uniforms),vertexShader:As.backgroundCube.vertexShader,fragmentShader:As.backgroundCube.fragmentShader,side:sr,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(N,L,B){this.matrixWorld.copyPosition(B.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),bl.copy(w.backgroundRotation),bl.x*=-1,bl.y*=-1,bl.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(bl.y*=-1,bl.z*=-1),d.material.uniforms.envMap.value=T,d.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(AX.makeRotationFromEuler(bl)),d.material.toneMapped=mn.getTransfer(T.colorSpace)!==An,(h!==T||p!==T.version||m!==t.toneMapping)&&(d.material.needsUpdate=!0,h=T,p=T.version,m=t.toneMapping),d.layers.enableAll(),_.unshift(d,d.geometry,d.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new Wn(new rl(2,2),new Er({name:"BackgroundMaterial",uniforms:Cf(As.background.uniforms),vertexShader:As.background.vertexShader,fragmentShader:As.background.fragmentShader,side:Yo,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.toneMapped=mn.getTransfer(T.colorSpace)!==An,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||p!==T.version||m!==t.toneMapping)&&(c.material.needsUpdate=!0,h=T,p=T.version,m=t.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function g(_,w){_.getRGB(kg,rL(t)),i.buffers.color.setClear(kg.r,kg.g,kg.b,w,o)}return{getClearColor:function(){return a},setClearColor:function(_,w=1){a.set(_),l=w,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,g(a,l)},render:S,addToRenderList:x}}function PX(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=p(null);let s=r,o=!1;function a(I,F,ge,J,W){let ve=!1;const le=h(J,ge,F);s!==le&&(s=le,c(s.object)),ve=m(I,J,ge,W),ve&&y(I,J,ge,W),W!==null&&e.update(W,t.ELEMENT_ARRAY_BUFFER),(ve||o)&&(o=!1,T(I,F,ge,J),W!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return t.createVertexArray()}function c(I){return t.bindVertexArray(I)}function d(I){return t.deleteVertexArray(I)}function h(I,F,ge){const J=ge.wireframe===!0;let W=i[I.id];W===void 0&&(W={},i[I.id]=W);let ve=W[F.id];ve===void 0&&(ve={},W[F.id]=ve);let le=ve[J];return le===void 0&&(le=p(l()),ve[J]=le),le}function p(I){const F=[],ge=[],J=[];for(let W=0;W<n;W++)F[W]=0,ge[W]=0,J[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:ge,attributeDivisors:J,object:I,attributes:{},index:null}}function m(I,F,ge,J){const W=s.attributes,ve=F.attributes;let le=0;const ke=ge.getAttributes();for(const ee in ke)if(ke[ee].location>=0){const _e=W[ee];let Ce=ve[ee];if(Ce===void 0&&(ee==="instanceMatrix"&&I.instanceMatrix&&(Ce=I.instanceMatrix),ee==="instanceColor"&&I.instanceColor&&(Ce=I.instanceColor)),_e===void 0||_e.attribute!==Ce||Ce&&_e.data!==Ce.data)return!0;le++}return s.attributesNum!==le||s.index!==J}function y(I,F,ge,J){const W={},ve=F.attributes;let le=0;const ke=ge.getAttributes();for(const ee in ke)if(ke[ee].location>=0){let _e=ve[ee];_e===void 0&&(ee==="instanceMatrix"&&I.instanceMatrix&&(_e=I.instanceMatrix),ee==="instanceColor"&&I.instanceColor&&(_e=I.instanceColor));const Ce={};Ce.attribute=_e,_e&&_e.data&&(Ce.data=_e.data),W[ee]=Ce,le++}s.attributes=W,s.attributesNum=le,s.index=J}function S(){const I=s.newAttributes;for(let F=0,ge=I.length;F<ge;F++)I[F]=0}function x(I){g(I,0)}function g(I,F){const ge=s.newAttributes,J=s.enabledAttributes,W=s.attributeDivisors;ge[I]=1,J[I]===0&&(t.enableVertexAttribArray(I),J[I]=1),W[I]!==F&&(t.vertexAttribDivisor(I,F),W[I]=F)}function _(){const I=s.newAttributes,F=s.enabledAttributes;for(let ge=0,J=F.length;ge<J;ge++)F[ge]!==I[ge]&&(t.disableVertexAttribArray(ge),F[ge]=0)}function w(I,F,ge,J,W,ve,le){le===!0?t.vertexAttribIPointer(I,F,ge,W,ve):t.vertexAttribPointer(I,F,ge,J,W,ve)}function T(I,F,ge,J){S();const W=J.attributes,ve=ge.getAttributes(),le=F.defaultAttributeValues;for(const ke in ve){const ee=ve[ke];if(ee.location>=0){let $=W[ke];if($===void 0&&(ke==="instanceMatrix"&&I.instanceMatrix&&($=I.instanceMatrix),ke==="instanceColor"&&I.instanceColor&&($=I.instanceColor)),$!==void 0){const _e=$.normalized,Ce=$.itemSize,Ye=e.get($);if(Ye===void 0)continue;const ct=Ye.buffer,De=Ye.type,je=Ye.bytesPerElement,qe=De===t.INT||De===t.UNSIGNED_INT||$.gpuType===Dp;if($.isInterleavedBufferAttribute){const it=$.data,bt=it.stride,Tt=$.offset;if(it.isInstancedInterleavedBuffer){for(let Nt=0;Nt<ee.locationSize;Nt++)g(ee.location+Nt,it.meshPerAttribute);I.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let Nt=0;Nt<ee.locationSize;Nt++)x(ee.location+Nt);t.bindBuffer(t.ARRAY_BUFFER,ct);for(let Nt=0;Nt<ee.locationSize;Nt++)w(ee.location+Nt,Ce/ee.locationSize,De,_e,bt*je,(Tt+Ce/ee.locationSize*Nt)*je,qe)}else{if($.isInstancedBufferAttribute){for(let it=0;it<ee.locationSize;it++)g(ee.location+it,$.meshPerAttribute);I.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let it=0;it<ee.locationSize;it++)x(ee.location+it);t.bindBuffer(t.ARRAY_BUFFER,ct);for(let it=0;it<ee.locationSize;it++)w(ee.location+it,Ce/ee.locationSize,De,_e,Ce*je,Ce/ee.locationSize*it*je,qe)}}else if(le!==void 0){const _e=le[ke];if(_e!==void 0)switch(_e.length){case 2:t.vertexAttrib2fv(ee.location,_e);break;case 3:t.vertexAttrib3fv(ee.location,_e);break;case 4:t.vertexAttrib4fv(ee.location,_e);break;default:t.vertexAttrib1fv(ee.location,_e)}}}}_()}function N(){O();for(const I in i){const F=i[I];for(const ge in F){const J=F[ge];for(const W in J)d(J[W].object),delete J[W];delete F[ge]}delete i[I]}}function L(I){if(i[I.id]===void 0)return;const F=i[I.id];for(const ge in F){const J=F[ge];for(const W in J)d(J[W].object),delete J[W];delete F[ge]}delete i[I.id]}function B(I){for(const F in i){const ge=i[F];if(ge[I.id]===void 0)continue;const J=ge[I.id];for(const W in J)d(J[W].object),delete J[W];delete ge[I.id]}}function O(){Q(),o=!0,s!==r&&(s=r,c(s.object))}function Q(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:O,resetDefaultState:Q,dispose:N,releaseStatesOfGeometry:L,releaseStatesOfProgram:B,initAttributes:S,enableAttribute:x,disableUnusedAttributes:_}}function RX(t,e,n){let i;function r(c){i=c}function s(c,d){t.drawArrays(i,c,d),n.update(d,i,1)}function o(c,d,h){h!==0&&(t.drawArraysInstanced(i,c,d,h),n.update(d,i,h))}function a(c,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,d,0,h);let m=0;for(let y=0;y<h;y++)m+=d[y];n.update(m,i,1)}function l(c,d,h,p){if(h===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let y=0;y<c.length;y++)o(c[y],d[y],p[y]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,d,0,p,0,h);let y=0;for(let S=0;S<h;S++)y+=d[S];for(let S=0;S<p.length;S++)n.update(y,i,p[S])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function IX(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const B=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(B.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(B){return!(B!==oi&&i.convert(B)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(B){const O=B===Ti&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(B!==Mr&&i.convert(B)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&B!==jn&&!O)}function l(B){if(B==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";B="mediump"}return B==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp";const d=l(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const h=n.logarithmicDepthBuffer===!0,p=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(p===!0){const B=e.get("EXT_clip_control");B.clipControlEXT(B.LOWER_LEFT_EXT,B.ZERO_TO_ONE_EXT)}const m=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),y=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),x=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),g=t.getParameter(t.MAX_VERTEX_ATTRIBS),_=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),w=t.getParameter(t.MAX_VARYING_VECTORS),T=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),N=y>0,L=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:p,maxTextures:m,maxVertexTextures:y,maxTextureSize:S,maxCubemapSize:x,maxAttributes:g,maxVertexUniforms:_,maxVaryings:w,maxFragmentUniforms:T,vertexTextures:N,maxSamples:L}}function kX(t){const e=this;let n=null,i=0,r=!1,s=!1;const o=new _a,a=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,p){const m=h.length!==0||p||i!==0||r;return r=p,i=h.length,m},this.beginShadows=function(){s=!0,d(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,p){n=d(h,p,0)},this.setState=function(h,p,m){const y=h.clippingPlanes,S=h.clipIntersection,x=h.clipShadows,g=t.get(h);if(!r||y===null||y.length===0||s&&!x)s?d(null):c();else{const _=s?0:i,w=_*4;let T=g.clippingState||null;l.value=T,T=d(y,p,w,m);for(let N=0;N!==w;++N)T[N]=n[N];g.clippingState=T,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(h,p,m,y){const S=h!==null?h.length:0;let x=null;if(S!==0){if(x=l.value,y!==!0||x===null){const g=m+S*4,_=p.matrixWorldInverse;a.getNormalMatrix(_),(x===null||x.length<g)&&(x=new Float32Array(g));for(let w=0,T=m;w!==S;++w,T+=4)o.copy(h[w]).applyMatrix4(_,a),o.normal.toArray(x,T),x[T+3]=o.constant}l.value=x,l.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,x}}function LX(t){let e=new WeakMap;function n(o,a){return a===Mf?o.mapping=oo:a===ip&&(o.mapping=$a),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Mf||a===ip)if(e.has(o)){const l=e.get(o).texture;return n(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new w2(l.height);return c.fromEquirectangularTexture(t,o),e.set(o,c),o.addEventListener("dispose",r),n(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class Gf extends Vp{constructor(e=-1,n=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const ef=4,KC=[.125,.215,.35,.446,.526,.582],jl=20,H_=new Gf,ZC=new Pt;let j_=null,W_=0,G_=0,X_=!1;const Hl=(1+Math.sqrt(5))/2,bu=1/Hl,JC=[new ce(-Hl,bu,0),new ce(Hl,bu,0),new ce(-bu,0,Hl),new ce(bu,0,Hl),new ce(0,Hl,-bu),new ce(0,Hl,bu),new ce(-1,1,-1),new ce(1,1,-1),new ce(-1,1,1),new ce(1,1,1)];class ZS{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){j_=this._renderer.getRenderTarget(),W_=this._renderer.getActiveCubeFace(),G_=this._renderer.getActiveMipmapLevel(),X_=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tP(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=eP(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(j_,W_,G_),this._renderer.xr.enabled=X_,e.scissorTest=!1,Lg(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===oo||e.mapping===$a?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),j_=this._renderer.getRenderTarget(),W_=this._renderer.getActiveCubeFace(),G_=this._renderer.getActiveMipmapLevel(),X_=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:gn,minFilter:gn,generateMipmaps:!1,type:Ti,format:oi,colorSpace:ps,depthBuffer:!1},r=QC(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=QC(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=UX(s)),this._blurMaterial=BX(s,e,n)}return r}_compileMaterial(e){const n=new Wn(this._lodPlanes[0],e);this._renderer.compile(n,H_)}_sceneToCubeUV(e,n,i,r){const a=new Mi(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,p=d.toneMapping;d.getClearColor(ZC),d.toneMapping=io,d.autoClear=!1;const m=new Ko({name:"PMREM.Background",side:sr,depthWrite:!1,depthTest:!1}),y=new Wn(new Gc,m);let S=!1;const x=e.background;x?x.isColor&&(m.color.copy(x),e.background=null,S=!0):(m.color.copy(ZC),S=!0);for(let g=0;g<6;g++){const _=g%3;_===0?(a.up.set(0,l[g],0),a.lookAt(c[g],0,0)):_===1?(a.up.set(0,0,l[g]),a.lookAt(0,c[g],0)):(a.up.set(0,l[g],0),a.lookAt(0,0,c[g]));const w=this._cubeSize;Lg(r,_*w,g>2?w:0,w,w),d.setRenderTarget(r),S&&d.render(y,a),d.render(e,a)}y.geometry.dispose(),y.material.dispose(),d.toneMapping=p,d.autoClear=h,e.background=x}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===oo||e.mapping===$a;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=tP()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=eP());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new Wn(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Lg(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(o,H_)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=JC[(r-s-1)%JC.length];this._blur(e,s-1,s,o,a)}n.autoClear=i}_blur(e,n,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,n,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,h=new Wn(this._lodPlanes[r],c),p=c.uniforms,m=this._sizeLods[i]-1,y=isFinite(s)?Math.PI/(2*m):2*Math.PI/(2*jl-1),S=s/y,x=isFinite(s)?1+Math.floor(d*S):jl;x>jl&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${jl}`);const g=[];let _=0;for(let B=0;B<jl;++B){const O=B/S,Q=Math.exp(-O*O/2);g.push(Q),B===0?_+=Q:B<x&&(_+=2*Q)}for(let B=0;B<g.length;B++)g[B]=g[B]/_;p.envMap.value=e.texture,p.samples.value=x,p.weights.value=g,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:w}=this;p.dTheta.value=y,p.mipInt.value=w-i;const T=this._sizeLods[r],N=3*T*(r>w-ef?r-w+ef:0),L=4*(this._cubeSize-T);Lg(n,N,L,3*T,2*T),l.setRenderTarget(n),l.render(h,H_)}}function UX(t){const e=[],n=[],i=[];let r=t;const s=t-ef+1+KC.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);n.push(a);let l=1/a;o>t-ef?l=KC[o-t+ef-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),d=-c,h=1+c,p=[d,d,h,d,h,h,d,d,h,h,d,h],m=6,y=6,S=3,x=2,g=1,_=new Float32Array(S*y*m),w=new Float32Array(x*y*m),T=new Float32Array(g*y*m);for(let L=0;L<m;L++){const B=L%3*2/3-1,O=L>2?0:-1,Q=[B,O,0,B+2/3,O,0,B+2/3,O+1,0,B,O,0,B+2/3,O+1,0,B,O+1,0];_.set(Q,S*y*L),w.set(p,x*y*L);const I=[L,L,L,L,L,L];T.set(I,g*y*L)}const N=new en;N.setAttribute("position",new Sn(_,S)),N.setAttribute("uv",new Sn(w,x)),N.setAttribute("faceIndex",new Sn(T,g)),e.push(N),r>ef&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function QC(t,e,n){const i=new jr(t,e,n);return i.texture.mapping=jf,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Lg(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function BX(t,e,n){const i=new Float32Array(jl),r=new ce(0,1,0);return new Er({name:"SphericalGaussianBlur",defines:{n:jl,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:S2(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:no,depthTest:!1,depthWrite:!1})}function eP(){return new Er({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:S2(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:no,depthTest:!1,depthWrite:!1})}function tP(){return new Er({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:S2(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:no,depthTest:!1,depthWrite:!1})}function S2(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function NX(t){let e=new WeakMap,n=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Mf||l===ip,d=l===oo||l===$a;if(c||d){let h=e.get(a);const p=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return n===null&&(n=new ZS(t)),h=c?n.fromEquirectangular(a,h):n.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const m=a.image;return c&&m&&m.height>0||d&&m&&r(m)?(n===null&&(n=new ZS(t)),h=c?n.fromEquirectangular(a):n.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0;const c=6;for(let d=0;d<c;d++)a[d]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function DX(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&C0("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function OX(t,e,n,i){const r={},s=new WeakMap;function o(h){const p=h.target;p.index!==null&&e.remove(p.index);for(const y in p.attributes)e.remove(p.attributes[y]);for(const y in p.morphAttributes){const S=p.morphAttributes[y];for(let x=0,g=S.length;x<g;x++)e.remove(S[x])}p.removeEventListener("dispose",o),delete r[p.id];const m=s.get(p);m&&(e.remove(m),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,n.memory.geometries--}function a(h,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,n.memory.geometries++),p}function l(h){const p=h.attributes;for(const y in p)e.update(p[y],t.ARRAY_BUFFER);const m=h.morphAttributes;for(const y in m){const S=m[y];for(let x=0,g=S.length;x<g;x++)e.update(S[x],t.ARRAY_BUFFER)}}function c(h){const p=[],m=h.index,y=h.attributes.position;let S=0;if(m!==null){const _=m.array;S=m.version;for(let w=0,T=_.length;w<T;w+=3){const N=_[w+0],L=_[w+1],B=_[w+2];p.push(N,L,L,B,B,N)}}else if(y!==void 0){const _=y.array;S=y.version;for(let w=0,T=_.length/3-1;w<T;w+=3){const N=w+0,L=w+1,B=w+2;p.push(N,L,L,B,B,N)}}else return;const x=new(Q6(p)?_2:x2)(p,1);x.version=S;const g=s.get(h);g&&e.remove(g),s.set(h,x)}function d(h){const p=s.get(h);if(p){const m=h.index;m!==null&&p.version<m.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:d}}function zX(t,e,n){let i;function r(p){i=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,m){t.drawElements(i,m,s,p*o),n.update(m,i,1)}function c(p,m,y){y!==0&&(t.drawElementsInstanced(i,m,s,p*o,y),n.update(m,i,y))}function d(p,m,y){if(y===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,s,p,0,y);let x=0;for(let g=0;g<y;g++)x+=m[g];n.update(x,i,1)}function h(p,m,y,S){if(y===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let g=0;g<p.length;g++)c(p[g]/o,m[g],S[g]);else{x.multiDrawElementsInstancedWEBGL(i,m,0,s,p,0,S,0,y);let g=0;for(let _=0;_<y;_++)g+=m[_];for(let _=0;_<S.length;_++)n.update(g,i,S[_])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function FX(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(s/3);break;case t.LINES:n.lines+=a*(s/2);break;case t.LINE_STRIP:n.lines+=a*(s-1);break;case t.LINE_LOOP:n.lines+=a*s;break;case t.POINTS:n.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function VX(t,e,n){const i=new WeakMap,r=new cn;function s(o,a,l){const c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=d!==void 0?d.length:0;let p=i.get(a);if(p===void 0||p.count!==h){let m=function(){O.dispose(),i.delete(a),a.removeEventListener("dispose",m)};p!==void 0&&p.texture.dispose();const y=a.morphAttributes.position!==void 0,S=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],_=a.morphAttributes.normal||[],w=a.morphAttributes.color||[];let T=0;y===!0&&(T=1),S===!0&&(T=2),x===!0&&(T=3);let N=a.attributes.position.count*T,L=1;N>e.maxTextureSize&&(L=Math.ceil(N/e.maxTextureSize),N=e.maxTextureSize);const B=new Float32Array(N*L*4*h),O=new Dv(B,N,L,h);O.type=jn,O.needsUpdate=!0;const Q=T*4;for(let I=0;I<h;I++){const F=g[I],ge=_[I],J=w[I],W=N*L*4*I;for(let ve=0;ve<F.count;ve++){const le=ve*Q;y===!0&&(r.fromBufferAttribute(F,ve),B[W+le+0]=r.x,B[W+le+1]=r.y,B[W+le+2]=r.z,B[W+le+3]=0),S===!0&&(r.fromBufferAttribute(ge,ve),B[W+le+4]=r.x,B[W+le+5]=r.y,B[W+le+6]=r.z,B[W+le+7]=0),x===!0&&(r.fromBufferAttribute(J,ve),B[W+le+8]=r.x,B[W+le+9]=r.y,B[W+le+10]=r.z,B[W+le+11]=J.itemSize===4?r.w:1)}}p={count:h,texture:O,size:new at(N,L)},i.set(a,p),a.addEventListener("dispose",m)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",o.morphTexture,n);else{let m=0;for(let S=0;S<c.length;S++)m+=c[S];const y=a.morphTargetsRelative?1:1-m;l.getUniforms().setValue(t,"morphTargetBaseInfluence",y),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",p.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",p.size)}return{update:s}}function HX(t,e,n,i){let r=new WeakMap;function s(l){const c=i.render.frame,d=l.geometry,h=e.get(l,d);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return h}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:o}}class b2 extends yn{constructor(e,n,i,r,s,o,a,l,c,d=rc){if(d!==rc&&d!==mc)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&d===rc&&(i=ao),i===void 0&&d===mc&&(i=pc),super(null,r,s,o,a,l,d,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=a!==void 0?a:Ei,this.minFilter=l!==void 0?l:Ei,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const lL=new yn,nP=new b2(1,1),cL=new Dv,uL=new v2,fL=new Hp,iP=[],rP=[],sP=new Float32Array(16),oP=new Float32Array(9),aP=new Float32Array(4);function Xf(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=iP[r];if(s===void 0&&(s=new Float32Array(r),iP[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(s,a)}return s}function yi(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function vi(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Ov(t,e){let n=rP[e];n===void 0&&(n=new Int32Array(e),rP[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function jX(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function WX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(yi(n,e))return;t.uniform2fv(this.addr,e),vi(n,e)}}function GX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(yi(n,e))return;t.uniform3fv(this.addr,e),vi(n,e)}}function XX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(yi(n,e))return;t.uniform4fv(this.addr,e),vi(n,e)}}function qX(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(yi(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),vi(n,e)}else{if(yi(n,i))return;aP.set(i),t.uniformMatrix2fv(this.addr,!1,aP),vi(n,i)}}function YX(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(yi(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),vi(n,e)}else{if(yi(n,i))return;oP.set(i),t.uniformMatrix3fv(this.addr,!1,oP),vi(n,i)}}function $X(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(yi(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),vi(n,e)}else{if(yi(n,i))return;sP.set(i),t.uniformMatrix4fv(this.addr,!1,sP),vi(n,i)}}function KX(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function ZX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(yi(n,e))return;t.uniform2iv(this.addr,e),vi(n,e)}}function JX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(yi(n,e))return;t.uniform3iv(this.addr,e),vi(n,e)}}function QX(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(yi(n,e))return;t.uniform4iv(this.addr,e),vi(n,e)}}function eq(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function tq(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(yi(n,e))return;t.uniform2uiv(this.addr,e),vi(n,e)}}function nq(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(yi(n,e))return;t.uniform3uiv(this.addr,e),vi(n,e)}}function iq(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(yi(n,e))return;t.uniform4uiv(this.addr,e),vi(n,e)}}function rq(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(nP.compareFunction=g2,s=nP):s=lL,n.setTexture2D(e||s,r)}function sq(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||uL,r)}function oq(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||fL,r)}function aq(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||cL,r)}function lq(t){switch(t){case 5126:return jX;case 35664:return WX;case 35665:return GX;case 35666:return XX;case 35674:return qX;case 35675:return YX;case 35676:return $X;case 5124:case 35670:return KX;case 35667:case 35671:return ZX;case 35668:case 35672:return JX;case 35669:case 35673:return QX;case 5125:return eq;case 36294:return tq;case 36295:return nq;case 36296:return iq;case 35678:case 36198:case 36298:case 36306:case 35682:return rq;case 35679:case 36299:case 36307:return sq;case 35680:case 36300:case 36308:case 36293:return oq;case 36289:case 36303:case 36311:case 36292:return aq}}function cq(t,e){t.uniform1fv(this.addr,e)}function uq(t,e){const n=Xf(e,this.size,2);t.uniform2fv(this.addr,n)}function fq(t,e){const n=Xf(e,this.size,3);t.uniform3fv(this.addr,n)}function dq(t,e){const n=Xf(e,this.size,4);t.uniform4fv(this.addr,n)}function hq(t,e){const n=Xf(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function pq(t,e){const n=Xf(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function mq(t,e){const n=Xf(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function gq(t,e){t.uniform1iv(this.addr,e)}function yq(t,e){t.uniform2iv(this.addr,e)}function vq(t,e){t.uniform3iv(this.addr,e)}function xq(t,e){t.uniform4iv(this.addr,e)}function _q(t,e){t.uniform1uiv(this.addr,e)}function wq(t,e){t.uniform2uiv(this.addr,e)}function Sq(t,e){t.uniform3uiv(this.addr,e)}function bq(t,e){t.uniform4uiv(this.addr,e)}function Mq(t,e,n){const i=this.cache,r=e.length,s=Ov(n,r);yi(i,s)||(t.uniform1iv(this.addr,s),vi(i,s));for(let o=0;o!==r;++o)n.setTexture2D(e[o]||lL,s[o])}function Eq(t,e,n){const i=this.cache,r=e.length,s=Ov(n,r);yi(i,s)||(t.uniform1iv(this.addr,s),vi(i,s));for(let o=0;o!==r;++o)n.setTexture3D(e[o]||uL,s[o])}function Tq(t,e,n){const i=this.cache,r=e.length,s=Ov(n,r);yi(i,s)||(t.uniform1iv(this.addr,s),vi(i,s));for(let o=0;o!==r;++o)n.setTextureCube(e[o]||fL,s[o])}function Aq(t,e,n){const i=this.cache,r=e.length,s=Ov(n,r);yi(i,s)||(t.uniform1iv(this.addr,s),vi(i,s));for(let o=0;o!==r;++o)n.setTexture2DArray(e[o]||cL,s[o])}function Cq(t){switch(t){case 5126:return cq;case 35664:return uq;case 35665:return fq;case 35666:return dq;case 35674:return hq;case 35675:return pq;case 35676:return mq;case 5124:case 35670:return gq;case 35667:case 35671:return yq;case 35668:case 35672:return vq;case 35669:case 35673:return xq;case 5125:return _q;case 36294:return wq;case 36295:return Sq;case 36296:return bq;case 35678:case 36198:case 36298:case 36306:case 35682:return Mq;case 35679:case 36299:case 36307:return Eq;case 35680:case 36300:case 36308:case 36293:return Tq;case 36289:case 36303:case 36311:case 36292:return Aq}}class Pq{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=lq(n.type)}}class Rq{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=Cq(n.type)}}class Iq{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,n[a.id],i)}}}const q_=/(\w+)(\])?(\[|\.)?/g;function lP(t,e){t.seq.push(e),t.map[e.id]=e}function kq(t,e,n){const i=t.name,r=i.length;for(q_.lastIndex=0;;){const s=q_.exec(i),o=q_.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){lP(n,c===void 0?new Pq(a,t,e):new Rq(a,t,e));break}else{let h=n.map[a];h===void 0&&(h=new Iq(a),lP(n,h)),n=h}}}class P0{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),o=e.getUniformLocation(n,s.name);kq(s,o,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,o=n.length;s!==o;++s){const a=n[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in n&&i.push(o)}return i}}function cP(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const Lq=37297;let Uq=0;function Bq(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}function Nq(t){const e=mn.getPrimaries(mn.workingColorSpace),n=mn.getPrimaries(t);let i;switch(e===n?i="":e===cp&&n===lp?i="LinearDisplayP3ToLinearSRGB":e===lp&&n===cp&&(i="LinearSRGBToLinearDisplayP3"),t){case ps:case Fp:return[i,"LinearTransferOETF"];case gr:case Nv:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function uP(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+Bq(t.getShaderSource(e),o)}else return r}function Dq(t,e){const n=Nq(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function Oq(t,e){let n;switch(e){case L6:n="Linear";break;case U6:n="Reinhard";break;case B6:n="Cineon";break;case o2:n="ACESFilmic";break;case D6:n="AgX";break;case O6:n="Neutral";break;case N6:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Ug=new ce;function zq(){mn.getLuminanceCoefficients(Ug);const t=Ug.x.toFixed(4),e=Ug.y.toFixed(4),n=Ug.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Fq(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(uh).join(`
`)}function Vq(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function Hq(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),o=s.name;let a=1;s.type===t.FLOAT_MAT2&&(a=2),s.type===t.FLOAT_MAT3&&(a=3),s.type===t.FLOAT_MAT4&&(a=4),n[o]={type:s.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function uh(t){return t!==""}function fP(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function dP(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const jq=/^[ \t]*#include +<([\w\d./]+)>/gm;function JS(t){return t.replace(jq,Gq)}const Wq=new Map;function Gq(t,e){let n=Qt[e];if(n===void 0){const i=Wq.get(e);if(i!==void 0)n=Qt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return JS(n)}const Xq=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hP(t){return t.replace(Xq,qq)}function qq(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function pP(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Yq(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===Cv?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===Eh?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===bs&&(e="SHADOWMAP_TYPE_VSM"),e}function $q(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case oo:case $a:e="ENVMAP_TYPE_CUBE";break;case jf:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Kq(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case $a:e="ENVMAP_MODE_REFRACTION";break}return e}function Zq(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case Np:e="ENVMAP_BLENDING_MULTIPLY";break;case I6:e="ENVMAP_BLENDING_MIX";break;case k6:e="ENVMAP_BLENDING_ADD";break}return e}function Jq(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function Qq(t,e,n,i){const r=t.getContext(),s=n.defines;let o=n.vertexShader,a=n.fragmentShader;const l=Yq(n),c=$q(n),d=Kq(n),h=Zq(n),p=Jq(n),m=Fq(n),y=Vq(s),S=r.createProgram();let x,g,_=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(x=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y].filter(uh).join(`
`),x.length>0&&(x+=`
`),g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y].filter(uh).join(`
`),g.length>0&&(g+=`
`)):(x=[pP(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+d:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(uh).join(`
`),g=[pP(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+d:"",n.envMap?"#define "+h:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==io?"#define TONE_MAPPING":"",n.toneMapping!==io?Qt.tonemapping_pars_fragment:"",n.toneMapping!==io?Oq("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Qt.colorspace_pars_fragment,Dq("linearToOutputTexel",n.outputColorSpace),zq(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(uh).join(`
`)),o=JS(o),o=fP(o,n),o=dP(o,n),a=JS(a),a=fP(a,n),a=dP(a,n),o=hP(o),a=hP(a),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,x=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,g=["#define varying in",n.glslVersion===KS?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===KS?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const w=_+x+o,T=_+g+a,N=cP(r,r.VERTEX_SHADER,w),L=cP(r,r.FRAGMENT_SHADER,T);r.attachShader(S,N),r.attachShader(S,L),n.index0AttributeName!==void 0?r.bindAttribLocation(S,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(S,0,"position"),r.linkProgram(S);function B(F){if(t.debug.checkShaderErrors){const ge=r.getProgramInfoLog(S).trim(),J=r.getShaderInfoLog(N).trim(),W=r.getShaderInfoLog(L).trim();let ve=!0,le=!0;if(r.getProgramParameter(S,r.LINK_STATUS)===!1)if(ve=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,S,N,L);else{const ke=uP(r,N,"vertex"),ee=uP(r,L,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(S,r.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+ge+`
`+ke+`
`+ee)}else ge!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ge):(J===""||W==="")&&(le=!1);le&&(F.diagnostics={runnable:ve,programLog:ge,vertexShader:{log:J,prefix:x},fragmentShader:{log:W,prefix:g}})}r.deleteShader(N),r.deleteShader(L),O=new P0(r,S),Q=Hq(r,S)}let O;this.getUniforms=function(){return O===void 0&&B(this),O};let Q;this.getAttributes=function(){return Q===void 0&&B(this),Q};let I=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=r.getProgramParameter(S,Lq)),I},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Uq++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=N,this.fragmentShader=L,this}let eY=0;class tY{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new nY(e),n.set(e,i)),i}}class nY{constructor(e){this.id=eY++,this.code=e,this.usedTimes=0}}function iY(t,e,n,i,r,s,o){const a=new oc,l=new tY,c=new Set,d=[],h=r.logarithmicDepthBuffer,p=r.reverseDepthBuffer,m=r.vertexTextures;let y=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(I){return c.add(I),I===0?"uv":`uv${I}`}function g(I,F,ge,J,W){const ve=J.fog,le=W.geometry,ke=I.isMeshStandardMaterial?J.environment:null,ee=(I.isMeshStandardMaterial?n:e).get(I.envMap||ke),$=ee&&ee.mapping===jf?ee.image.height:null,_e=S[I.type];I.precision!==null&&(y=r.getMaxPrecision(I.precision),y!==I.precision&&console.warn("THREE.WebGLProgram.getParameters:",I.precision,"not supported, using",y,"instead."));const Ce=le.morphAttributes.position||le.morphAttributes.normal||le.morphAttributes.color,Ye=Ce!==void 0?Ce.length:0;let ct=0;le.morphAttributes.position!==void 0&&(ct=1),le.morphAttributes.normal!==void 0&&(ct=2),le.morphAttributes.color!==void 0&&(ct=3);let De,je,qe,it;if(_e){const xn=As[_e];De=xn.vertexShader,je=xn.fragmentShader}else De=I.vertexShader,je=I.fragmentShader,l.update(I),qe=l.getVertexShaderID(I),it=l.getFragmentShaderID(I);const bt=t.getRenderTarget(),Tt=W.isInstancedMesh===!0,Nt=W.isBatchedMesh===!0,Dt=!!I.map,st=!!I.matcap,se=!!ee,ht=!!I.aoMap,mt=!!I.lightMap,ut=!!I.bumpMap,gt=!!I.normalMap,Rt=!!I.displacementMap,vt=!!I.emissiveMap,re=!!I.metalnessMap,G=!!I.roughnessMap,Le=I.anisotropy>0,et=I.clearcoat>0,ot=I.dispersion>0,te=I.iridescence>0,q=I.sheen>0,C=I.transmission>0,b=Le&&!!I.anisotropyMap,E=et&&!!I.clearcoatMap,R=et&&!!I.clearcoatNormalMap,X=et&&!!I.clearcoatRoughnessMap,ne=te&&!!I.iridescenceMap,he=te&&!!I.iridescenceThicknessMap,be=q&&!!I.sheenColorMap,nt=q&&!!I.sheenRoughnessMap,ze=!!I.specularMap,Xe=!!I.specularColorMap,ue=!!I.specularIntensityMap,Fe=C&&!!I.transmissionMap,ye=C&&!!I.thicknessMap,Ge=!!I.gradientMap,lt=!!I.alphaMap,ft=I.alphaTest>0,Ot=!!I.alphaHash,Xt=!!I.extensions;let sn=io;I.toneMapped&&(bt===null||bt.isXRRenderTarget===!0)&&(sn=t.toneMapping);const Yt={shaderID:_e,shaderType:I.type,shaderName:I.name,vertexShader:De,fragmentShader:je,defines:I.defines,customVertexShaderID:qe,customFragmentShaderID:it,isRawShaderMaterial:I.isRawShaderMaterial===!0,glslVersion:I.glslVersion,precision:y,batching:Nt,batchingColor:Nt&&W._colorsTexture!==null,instancing:Tt,instancingColor:Tt&&W.instanceColor!==null,instancingMorph:Tt&&W.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:bt===null?t.outputColorSpace:bt.isXRRenderTarget===!0?bt.texture.colorSpace:ps,alphaToCoverage:!!I.alphaToCoverage,map:Dt,matcap:st,envMap:se,envMapMode:se&&ee.mapping,envMapCubeUVHeight:$,aoMap:ht,lightMap:mt,bumpMap:ut,normalMap:gt,displacementMap:m&&Rt,emissiveMap:vt,normalMapObjectSpace:gt&&I.normalMapType===G6,normalMapTangentSpace:gt&&I.normalMapType===il,metalnessMap:re,roughnessMap:G,anisotropy:Le,anisotropyMap:b,clearcoat:et,clearcoatMap:E,clearcoatNormalMap:R,clearcoatRoughnessMap:X,dispersion:ot,iridescence:te,iridescenceMap:ne,iridescenceThicknessMap:he,sheen:q,sheenColorMap:be,sheenRoughnessMap:nt,specularMap:ze,specularColorMap:Xe,specularIntensityMap:ue,transmission:C,transmissionMap:Fe,thicknessMap:ye,gradientMap:Ge,opaque:I.transparent===!1&&I.blending===ic&&I.alphaToCoverage===!1,alphaMap:lt,alphaTest:ft,alphaHash:Ot,combine:I.combine,mapUv:Dt&&x(I.map.channel),aoMapUv:ht&&x(I.aoMap.channel),lightMapUv:mt&&x(I.lightMap.channel),bumpMapUv:ut&&x(I.bumpMap.channel),normalMapUv:gt&&x(I.normalMap.channel),displacementMapUv:Rt&&x(I.displacementMap.channel),emissiveMapUv:vt&&x(I.emissiveMap.channel),metalnessMapUv:re&&x(I.metalnessMap.channel),roughnessMapUv:G&&x(I.roughnessMap.channel),anisotropyMapUv:b&&x(I.anisotropyMap.channel),clearcoatMapUv:E&&x(I.clearcoatMap.channel),clearcoatNormalMapUv:R&&x(I.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:X&&x(I.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&x(I.iridescenceMap.channel),iridescenceThicknessMapUv:he&&x(I.iridescenceThicknessMap.channel),sheenColorMapUv:be&&x(I.sheenColorMap.channel),sheenRoughnessMapUv:nt&&x(I.sheenRoughnessMap.channel),specularMapUv:ze&&x(I.specularMap.channel),specularColorMapUv:Xe&&x(I.specularColorMap.channel),specularIntensityMapUv:ue&&x(I.specularIntensityMap.channel),transmissionMapUv:Fe&&x(I.transmissionMap.channel),thicknessMapUv:ye&&x(I.thicknessMap.channel),alphaMapUv:lt&&x(I.alphaMap.channel),vertexTangents:!!le.attributes.tangent&&(gt||Le),vertexColors:I.vertexColors,vertexAlphas:I.vertexColors===!0&&!!le.attributes.color&&le.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!le.attributes.uv&&(Dt||lt),fog:!!ve,useFog:I.fog===!0,fogExp2:!!ve&&ve.isFogExp2,flatShading:I.flatShading===!0,sizeAttenuation:I.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:p,skinning:W.isSkinnedMesh===!0,morphTargets:le.morphAttributes.position!==void 0,morphNormals:le.morphAttributes.normal!==void 0,morphColors:le.morphAttributes.color!==void 0,morphTargetsCount:Ye,morphTextureStride:ct,numDirLights:F.directional.length,numPointLights:F.point.length,numSpotLights:F.spot.length,numSpotLightMaps:F.spotLightMap.length,numRectAreaLights:F.rectArea.length,numHemiLights:F.hemi.length,numDirLightShadows:F.directionalShadowMap.length,numPointLightShadows:F.pointShadowMap.length,numSpotLightShadows:F.spotShadowMap.length,numSpotLightShadowsWithMaps:F.numSpotLightShadowsWithMaps,numLightProbes:F.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:I.dithering,shadowMapEnabled:t.shadowMap.enabled&&ge.length>0,shadowMapType:t.shadowMap.type,toneMapping:sn,decodeVideoTexture:Dt&&I.map.isVideoTexture===!0&&mn.getTransfer(I.map.colorSpace)===An,premultipliedAlpha:I.premultipliedAlpha,doubleSided:I.side===ls,flipSided:I.side===sr,useDepthPacking:I.depthPacking>=0,depthPacking:I.depthPacking||0,index0AttributeName:I.index0AttributeName,extensionClipCullDistance:Xt&&I.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xt&&I.extensions.multiDraw===!0||Nt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:I.customProgramCacheKey()};return Yt.vertexUv1s=c.has(1),Yt.vertexUv2s=c.has(2),Yt.vertexUv3s=c.has(3),c.clear(),Yt}function _(I){const F=[];if(I.shaderID?F.push(I.shaderID):(F.push(I.customVertexShaderID),F.push(I.customFragmentShaderID)),I.defines!==void 0)for(const ge in I.defines)F.push(ge),F.push(I.defines[ge]);return I.isRawShaderMaterial===!1&&(w(F,I),T(F,I),F.push(t.outputColorSpace)),F.push(I.customProgramCacheKey),F.join()}function w(I,F){I.push(F.precision),I.push(F.outputColorSpace),I.push(F.envMapMode),I.push(F.envMapCubeUVHeight),I.push(F.mapUv),I.push(F.alphaMapUv),I.push(F.lightMapUv),I.push(F.aoMapUv),I.push(F.bumpMapUv),I.push(F.normalMapUv),I.push(F.displacementMapUv),I.push(F.emissiveMapUv),I.push(F.metalnessMapUv),I.push(F.roughnessMapUv),I.push(F.anisotropyMapUv),I.push(F.clearcoatMapUv),I.push(F.clearcoatNormalMapUv),I.push(F.clearcoatRoughnessMapUv),I.push(F.iridescenceMapUv),I.push(F.iridescenceThicknessMapUv),I.push(F.sheenColorMapUv),I.push(F.sheenRoughnessMapUv),I.push(F.specularMapUv),I.push(F.specularColorMapUv),I.push(F.specularIntensityMapUv),I.push(F.transmissionMapUv),I.push(F.thicknessMapUv),I.push(F.combine),I.push(F.fogExp2),I.push(F.sizeAttenuation),I.push(F.morphTargetsCount),I.push(F.morphAttributeCount),I.push(F.numDirLights),I.push(F.numPointLights),I.push(F.numSpotLights),I.push(F.numSpotLightMaps),I.push(F.numHemiLights),I.push(F.numRectAreaLights),I.push(F.numDirLightShadows),I.push(F.numPointLightShadows),I.push(F.numSpotLightShadows),I.push(F.numSpotLightShadowsWithMaps),I.push(F.numLightProbes),I.push(F.shadowMapType),I.push(F.toneMapping),I.push(F.numClippingPlanes),I.push(F.numClipIntersection),I.push(F.depthPacking)}function T(I,F){a.disableAll(),F.supportsVertexTextures&&a.enable(0),F.instancing&&a.enable(1),F.instancingColor&&a.enable(2),F.instancingMorph&&a.enable(3),F.matcap&&a.enable(4),F.envMap&&a.enable(5),F.normalMapObjectSpace&&a.enable(6),F.normalMapTangentSpace&&a.enable(7),F.clearcoat&&a.enable(8),F.iridescence&&a.enable(9),F.alphaTest&&a.enable(10),F.vertexColors&&a.enable(11),F.vertexAlphas&&a.enable(12),F.vertexUv1s&&a.enable(13),F.vertexUv2s&&a.enable(14),F.vertexUv3s&&a.enable(15),F.vertexTangents&&a.enable(16),F.anisotropy&&a.enable(17),F.alphaHash&&a.enable(18),F.batching&&a.enable(19),F.dispersion&&a.enable(20),F.batchingColor&&a.enable(21),I.push(a.mask),a.disableAll(),F.fog&&a.enable(0),F.useFog&&a.enable(1),F.flatShading&&a.enable(2),F.logarithmicDepthBuffer&&a.enable(3),F.reverseDepthBuffer&&a.enable(4),F.skinning&&a.enable(5),F.morphTargets&&a.enable(6),F.morphNormals&&a.enable(7),F.morphColors&&a.enable(8),F.premultipliedAlpha&&a.enable(9),F.shadowMapEnabled&&a.enable(10),F.doubleSided&&a.enable(11),F.flipSided&&a.enable(12),F.useDepthPacking&&a.enable(13),F.dithering&&a.enable(14),F.transmission&&a.enable(15),F.sheen&&a.enable(16),F.opaque&&a.enable(17),F.pointsUvs&&a.enable(18),F.decodeVideoTexture&&a.enable(19),F.alphaToCoverage&&a.enable(20),I.push(a.mask)}function N(I){const F=S[I.type];let ge;if(F){const J=As[F];ge=sL.clone(J.uniforms)}else ge=I.uniforms;return ge}function L(I,F){let ge;for(let J=0,W=d.length;J<W;J++){const ve=d[J];if(ve.cacheKey===F){ge=ve,++ge.usedTimes;break}}return ge===void 0&&(ge=new Qq(t,F,I,s),d.push(ge)),ge}function B(I){if(--I.usedTimes===0){const F=d.indexOf(I);d[F]=d[d.length-1],d.pop(),I.destroy()}}function O(I){l.remove(I)}function Q(){l.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:N,acquireProgram:L,releaseProgram:B,releaseShaderCache:O,programs:d,dispose:Q}}function rY(){let t=new WeakMap;function e(o){return t.has(o)}function n(o){let a=t.get(o);return a===void 0&&(a={},t.set(o,a)),a}function i(o){t.delete(o)}function r(o,a,l){t.get(o)[a]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function sY(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function mP(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function gP(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function o(h,p,m,y,S,x){let g=t[e];return g===void 0?(g={id:h.id,object:h,geometry:p,material:m,groupOrder:y,renderOrder:h.renderOrder,z:S,group:x},t[e]=g):(g.id=h.id,g.object=h,g.geometry=p,g.material=m,g.groupOrder=y,g.renderOrder=h.renderOrder,g.z=S,g.group=x),e++,g}function a(h,p,m,y,S,x){const g=o(h,p,m,y,S,x);m.transmission>0?i.push(g):m.transparent===!0?r.push(g):n.push(g)}function l(h,p,m,y,S,x){const g=o(h,p,m,y,S,x);m.transmission>0?i.unshift(g):m.transparent===!0?r.unshift(g):n.unshift(g)}function c(h,p){n.length>1&&n.sort(h||sY),i.length>1&&i.sort(p||mP),r.length>1&&r.sort(p||mP)}function d(){for(let h=e,p=t.length;h<p;h++){const m=t[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:d,sort:c}}function oY(){let t=new WeakMap;function e(i,r){const s=t.get(i);let o;return s===void 0?(o=new gP,t.set(i,[o])):r>=s.length?(o=new gP,s.push(o)):o=s[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}function aY(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new ce,color:new Pt};break;case"SpotLight":n={position:new ce,direction:new ce,color:new Pt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new ce,color:new Pt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new ce,skyColor:new Pt,groundColor:new Pt};break;case"RectAreaLight":n={color:new Pt,position:new ce,halfWidth:new ce,halfHeight:new ce};break}return t[e.id]=n,n}}}function lY(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let cY=0;function uY(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function fY(t){const e=new aY,n=lY(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new ce);const r=new ce,s=new Wt,o=new Wt;function a(c){let d=0,h=0,p=0;for(let Q=0;Q<9;Q++)i.probe[Q].set(0,0,0);let m=0,y=0,S=0,x=0,g=0,_=0,w=0,T=0,N=0,L=0,B=0;c.sort(uY);for(let Q=0,I=c.length;Q<I;Q++){const F=c[Q],ge=F.color,J=F.intensity,W=F.distance,ve=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)d+=ge.r*J,h+=ge.g*J,p+=ge.b*J;else if(F.isLightProbe){for(let le=0;le<9;le++)i.probe[le].addScaledVector(F.sh.coefficients[le],J);B++}else if(F.isDirectionalLight){const le=e.get(F);if(le.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const ke=F.shadow,ee=n.get(F);ee.shadowIntensity=ke.intensity,ee.shadowBias=ke.bias,ee.shadowNormalBias=ke.normalBias,ee.shadowRadius=ke.radius,ee.shadowMapSize=ke.mapSize,i.directionalShadow[m]=ee,i.directionalShadowMap[m]=ve,i.directionalShadowMatrix[m]=F.shadow.matrix,_++}i.directional[m]=le,m++}else if(F.isSpotLight){const le=e.get(F);le.position.setFromMatrixPosition(F.matrixWorld),le.color.copy(ge).multiplyScalar(J),le.distance=W,le.coneCos=Math.cos(F.angle),le.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),le.decay=F.decay,i.spot[S]=le;const ke=F.shadow;if(F.map&&(i.spotLightMap[N]=F.map,N++,ke.updateMatrices(F),F.castShadow&&L++),i.spotLightMatrix[S]=ke.matrix,F.castShadow){const ee=n.get(F);ee.shadowIntensity=ke.intensity,ee.shadowBias=ke.bias,ee.shadowNormalBias=ke.normalBias,ee.shadowRadius=ke.radius,ee.shadowMapSize=ke.mapSize,i.spotShadow[S]=ee,i.spotShadowMap[S]=ve,T++}S++}else if(F.isRectAreaLight){const le=e.get(F);le.color.copy(ge).multiplyScalar(J),le.halfWidth.set(F.width*.5,0,0),le.halfHeight.set(0,F.height*.5,0),i.rectArea[x]=le,x++}else if(F.isPointLight){const le=e.get(F);if(le.color.copy(F.color).multiplyScalar(F.intensity),le.distance=F.distance,le.decay=F.decay,F.castShadow){const ke=F.shadow,ee=n.get(F);ee.shadowIntensity=ke.intensity,ee.shadowBias=ke.bias,ee.shadowNormalBias=ke.normalBias,ee.shadowRadius=ke.radius,ee.shadowMapSize=ke.mapSize,ee.shadowCameraNear=ke.camera.near,ee.shadowCameraFar=ke.camera.far,i.pointShadow[y]=ee,i.pointShadowMap[y]=ve,i.pointShadowMatrix[y]=F.shadow.matrix,w++}i.point[y]=le,y++}else if(F.isHemisphereLight){const le=e.get(F);le.skyColor.copy(F.color).multiplyScalar(J),le.groundColor.copy(F.groundColor).multiplyScalar(J),i.hemi[g]=le,g++}}x>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=St.LTC_FLOAT_1,i.rectAreaLTC2=St.LTC_FLOAT_2):(i.rectAreaLTC1=St.LTC_HALF_1,i.rectAreaLTC2=St.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=h,i.ambient[2]=p;const O=i.hash;(O.directionalLength!==m||O.pointLength!==y||O.spotLength!==S||O.rectAreaLength!==x||O.hemiLength!==g||O.numDirectionalShadows!==_||O.numPointShadows!==w||O.numSpotShadows!==T||O.numSpotMaps!==N||O.numLightProbes!==B)&&(i.directional.length=m,i.spot.length=S,i.rectArea.length=x,i.point.length=y,i.hemi.length=g,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=w,i.pointShadowMap.length=w,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=w,i.spotLightMatrix.length=T+N-L,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=L,i.numLightProbes=B,O.directionalLength=m,O.pointLength=y,O.spotLength=S,O.rectAreaLength=x,O.hemiLength=g,O.numDirectionalShadows=_,O.numPointShadows=w,O.numSpotShadows=T,O.numSpotMaps=N,O.numLightProbes=B,i.version=cY++)}function l(c,d){let h=0,p=0,m=0,y=0,S=0;const x=d.matrixWorldInverse;for(let g=0,_=c.length;g<_;g++){const w=c[g];if(w.isDirectionalLight){const T=i.directional[h];T.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(x),h++}else if(w.isSpotLight){const T=i.spot[m];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),T.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(x),m++}else if(w.isRectAreaLight){const T=i.rectArea[y];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),o.identity(),s.copy(w.matrixWorld),s.premultiply(x),o.extractRotation(s),T.halfWidth.set(w.width*.5,0,0),T.halfHeight.set(0,w.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),y++}else if(w.isPointLight){const T=i.point[p];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(x),p++}else if(w.isHemisphereLight){const T=i.hemi[S];T.direction.setFromMatrixPosition(w.matrixWorld),T.direction.transformDirection(x),S++}}}return{setup:a,setupView:l,state:i}}function yP(t){const e=new fY(t),n=[],i=[];function r(d){c.camera=d,n.length=0,i.length=0}function s(d){n.push(d)}function o(d){i.push(d)}function a(){e.setup(n)}function l(d){e.setupView(n,d)}const c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function dY(t){let e=new WeakMap;function n(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new yP(t),e.set(r,[a])):s>=o.length?(a=new yP(t),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:n,dispose:i}}class M2 extends Li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=j6,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class E2 extends Li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const hY=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pY=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function mY(t,e,n){let i=new jp;const r=new at,s=new at,o=new cn,a=new M2({depthPacking:W6}),l=new E2,c={},d=n.maxTextureSize,h={[Yo]:sr,[sr]:Yo,[ls]:ls},p=new Er({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:hY,fragmentShader:pY}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const y=new en;y.setAttribute("position",new Sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new Wn(y,p),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Cv;let g=this.type;this.render=function(L,B,O){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||L.length===0)return;const Q=t.getRenderTarget(),I=t.getActiveCubeFace(),F=t.getActiveMipmapLevel(),ge=t.state;ge.setBlending(no),ge.buffers.color.setClear(1,1,1,1),ge.buffers.depth.setTest(!0),ge.setScissorTest(!1);const J=g!==bs&&this.type===bs,W=g===bs&&this.type!==bs;for(let ve=0,le=L.length;ve<le;ve++){const ke=L[ve],ee=ke.shadow;if(ee===void 0){console.warn("THREE.WebGLShadowMap:",ke,"has no shadow.");continue}if(ee.autoUpdate===!1&&ee.needsUpdate===!1)continue;r.copy(ee.mapSize);const $=ee.getFrameExtents();if(r.multiply($),s.copy(ee.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(s.x=Math.floor(d/$.x),r.x=s.x*$.x,ee.mapSize.x=s.x),r.y>d&&(s.y=Math.floor(d/$.y),r.y=s.y*$.y,ee.mapSize.y=s.y)),ee.map===null||J===!0||W===!0){const Ce=this.type!==bs?{minFilter:Ei,magFilter:Ei}:{};ee.map!==null&&ee.map.dispose(),ee.map=new jr(r.x,r.y,Ce),ee.map.texture.name=ke.name+".shadowMap",ee.camera.updateProjectionMatrix()}t.setRenderTarget(ee.map),t.clear();const _e=ee.getViewportCount();for(let Ce=0;Ce<_e;Ce++){const Ye=ee.getViewport(Ce);o.set(s.x*Ye.x,s.y*Ye.y,s.x*Ye.z,s.y*Ye.w),ge.viewport(o),ee.updateMatrices(ke,Ce),i=ee.getFrustum(),T(B,O,ee.camera,ke,this.type)}ee.isPointLightShadow!==!0&&this.type===bs&&_(ee,O),ee.needsUpdate=!1}g=this.type,x.needsUpdate=!1,t.setRenderTarget(Q,I,F)};function _(L,B){const O=e.update(S);p.defines.VSM_SAMPLES!==L.blurSamples&&(p.defines.VSM_SAMPLES=L.blurSamples,m.defines.VSM_SAMPLES=L.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),L.mapPass===null&&(L.mapPass=new jr(r.x,r.y)),p.uniforms.shadow_pass.value=L.map.texture,p.uniforms.resolution.value=L.mapSize,p.uniforms.radius.value=L.radius,t.setRenderTarget(L.mapPass),t.clear(),t.renderBufferDirect(B,null,O,p,S,null),m.uniforms.shadow_pass.value=L.mapPass.texture,m.uniforms.resolution.value=L.mapSize,m.uniforms.radius.value=L.radius,t.setRenderTarget(L.map),t.clear(),t.renderBufferDirect(B,null,O,m,S,null)}function w(L,B,O,Q){let I=null;const F=O.isPointLight===!0?L.customDistanceMaterial:L.customDepthMaterial;if(F!==void 0)I=F;else if(I=O.isPointLight===!0?l:a,t.localClippingEnabled&&B.clipShadows===!0&&Array.isArray(B.clippingPlanes)&&B.clippingPlanes.length!==0||B.displacementMap&&B.displacementScale!==0||B.alphaMap&&B.alphaTest>0||B.map&&B.alphaTest>0){const ge=I.uuid,J=B.uuid;let W=c[ge];W===void 0&&(W={},c[ge]=W);let ve=W[J];ve===void 0&&(ve=I.clone(),W[J]=ve,B.addEventListener("dispose",N)),I=ve}if(I.visible=B.visible,I.wireframe=B.wireframe,Q===bs?I.side=B.shadowSide!==null?B.shadowSide:B.side:I.side=B.shadowSide!==null?B.shadowSide:h[B.side],I.alphaMap=B.alphaMap,I.alphaTest=B.alphaTest,I.map=B.map,I.clipShadows=B.clipShadows,I.clippingPlanes=B.clippingPlanes,I.clipIntersection=B.clipIntersection,I.displacementMap=B.displacementMap,I.displacementScale=B.displacementScale,I.displacementBias=B.displacementBias,I.wireframeLinewidth=B.wireframeLinewidth,I.linewidth=B.linewidth,O.isPointLight===!0&&I.isMeshDistanceMaterial===!0){const ge=t.properties.get(I);ge.light=O}return I}function T(L,B,O,Q,I){if(L.visible===!1)return;if(L.layers.test(B.layers)&&(L.isMesh||L.isLine||L.isPoints)&&(L.castShadow||L.receiveShadow&&I===bs)&&(!L.frustumCulled||i.intersectsObject(L))){L.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,L.matrixWorld);const J=e.update(L),W=L.material;if(Array.isArray(W)){const ve=J.groups;for(let le=0,ke=ve.length;le<ke;le++){const ee=ve[le],$=W[ee.materialIndex];if($&&$.visible){const _e=w(L,$,Q,I);L.onBeforeShadow(t,L,B,O,J,_e,ee),t.renderBufferDirect(O,null,J,_e,L,ee),L.onAfterShadow(t,L,B,O,J,_e,ee)}}}else if(W.visible){const ve=w(L,W,Q,I);L.onBeforeShadow(t,L,B,O,J,ve,null),t.renderBufferDirect(O,null,J,ve,L,null),L.onAfterShadow(t,L,B,O,J,ve,null)}}const ge=L.children;for(let J=0,W=ge.length;J<W;J++)T(ge[J],B,O,Q,I)}function N(L){L.target.removeEventListener("dispose",N);for(const O in c){const Q=c[O],I=L.target.uuid;I in Q&&(Q[I].dispose(),delete Q[I])}}}const gY={[py]:my,[gy]:xy,[yy]:_y,[hc]:vy,[my]:py,[xy]:gy,[_y]:yy,[vy]:hc};function yY(t){function e(){let ue=!1;const Fe=new cn;let ye=null;const Ge=new cn(0,0,0,0);return{setMask:function(lt){ye!==lt&&!ue&&(t.colorMask(lt,lt,lt,lt),ye=lt)},setLocked:function(lt){ue=lt},setClear:function(lt,ft,Ot,Xt,sn){sn===!0&&(lt*=Xt,ft*=Xt,Ot*=Xt),Fe.set(lt,ft,Ot,Xt),Ge.equals(Fe)===!1&&(t.clearColor(lt,ft,Ot,Xt),Ge.copy(Fe))},reset:function(){ue=!1,ye=null,Ge.set(-1,0,0,0)}}}function n(){let ue=!1,Fe=!1,ye=null,Ge=null,lt=null;return{setReversed:function(ft){Fe=ft},setTest:function(ft){ft?qe(t.DEPTH_TEST):it(t.DEPTH_TEST)},setMask:function(ft){ye!==ft&&!ue&&(t.depthMask(ft),ye=ft)},setFunc:function(ft){if(Fe&&(ft=gY[ft]),Ge!==ft){switch(ft){case py:t.depthFunc(t.NEVER);break;case my:t.depthFunc(t.ALWAYS);break;case gy:t.depthFunc(t.LESS);break;case hc:t.depthFunc(t.LEQUAL);break;case yy:t.depthFunc(t.EQUAL);break;case vy:t.depthFunc(t.GEQUAL);break;case xy:t.depthFunc(t.GREATER);break;case _y:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}Ge=ft}},setLocked:function(ft){ue=ft},setClear:function(ft){lt!==ft&&(t.clearDepth(ft),lt=ft)},reset:function(){ue=!1,ye=null,Ge=null,lt=null}}}function i(){let ue=!1,Fe=null,ye=null,Ge=null,lt=null,ft=null,Ot=null,Xt=null,sn=null;return{setTest:function(Yt){ue||(Yt?qe(t.STENCIL_TEST):it(t.STENCIL_TEST))},setMask:function(Yt){Fe!==Yt&&!ue&&(t.stencilMask(Yt),Fe=Yt)},setFunc:function(Yt,xn,Dn){(ye!==Yt||Ge!==xn||lt!==Dn)&&(t.stencilFunc(Yt,xn,Dn),ye=Yt,Ge=xn,lt=Dn)},setOp:function(Yt,xn,Dn){(ft!==Yt||Ot!==xn||Xt!==Dn)&&(t.stencilOp(Yt,xn,Dn),ft=Yt,Ot=xn,Xt=Dn)},setLocked:function(Yt){ue=Yt},setClear:function(Yt){sn!==Yt&&(t.clearStencil(Yt),sn=Yt)},reset:function(){ue=!1,Fe=null,ye=null,Ge=null,lt=null,ft=null,Ot=null,Xt=null,sn=null}}}const r=new e,s=new n,o=new i,a=new WeakMap,l=new WeakMap;let c={},d={},h=new WeakMap,p=[],m=null,y=!1,S=null,x=null,g=null,_=null,w=null,T=null,N=null,L=new Pt(0,0,0),B=0,O=!1,Q=null,I=null,F=null,ge=null,J=null;const W=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let ve=!1,le=0;const ke=t.getParameter(t.VERSION);ke.indexOf("WebGL")!==-1?(le=parseFloat(/^WebGL (\d)/.exec(ke)[1]),ve=le>=1):ke.indexOf("OpenGL ES")!==-1&&(le=parseFloat(/^OpenGL ES (\d)/.exec(ke)[1]),ve=le>=2);let ee=null,$={};const _e=t.getParameter(t.SCISSOR_BOX),Ce=t.getParameter(t.VIEWPORT),Ye=new cn().fromArray(_e),ct=new cn().fromArray(Ce);function De(ue,Fe,ye,Ge){const lt=new Uint8Array(4),ft=t.createTexture();t.bindTexture(ue,ft),t.texParameteri(ue,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(ue,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let Ot=0;Ot<ye;Ot++)ue===t.TEXTURE_3D||ue===t.TEXTURE_2D_ARRAY?t.texImage3D(Fe,0,t.RGBA,1,1,Ge,0,t.RGBA,t.UNSIGNED_BYTE,lt):t.texImage2D(Fe+Ot,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,lt);return ft}const je={};je[t.TEXTURE_2D]=De(t.TEXTURE_2D,t.TEXTURE_2D,1),je[t.TEXTURE_CUBE_MAP]=De(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),je[t.TEXTURE_2D_ARRAY]=De(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),je[t.TEXTURE_3D]=De(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),qe(t.DEPTH_TEST),s.setFunc(hc),mt(!1),ut(WS),qe(t.CULL_FACE),se(no);function qe(ue){c[ue]!==!0&&(t.enable(ue),c[ue]=!0)}function it(ue){c[ue]!==!1&&(t.disable(ue),c[ue]=!1)}function bt(ue,Fe){return d[ue]!==Fe?(t.bindFramebuffer(ue,Fe),d[ue]=Fe,ue===t.DRAW_FRAMEBUFFER&&(d[t.FRAMEBUFFER]=Fe),ue===t.FRAMEBUFFER&&(d[t.DRAW_FRAMEBUFFER]=Fe),!0):!1}function Tt(ue,Fe){let ye=p,Ge=!1;if(ue){ye=h.get(Fe),ye===void 0&&(ye=[],h.set(Fe,ye));const lt=ue.textures;if(ye.length!==lt.length||ye[0]!==t.COLOR_ATTACHMENT0){for(let ft=0,Ot=lt.length;ft<Ot;ft++)ye[ft]=t.COLOR_ATTACHMENT0+ft;ye.length=lt.length,Ge=!0}}else ye[0]!==t.BACK&&(ye[0]=t.BACK,Ge=!0);Ge&&t.drawBuffers(ye)}function Nt(ue){return m!==ue?(t.useProgram(ue),m=ue,!0):!1}const Dt={[ba]:t.FUNC_ADD,[p6]:t.FUNC_SUBTRACT,[m6]:t.FUNC_REVERSE_SUBTRACT};Dt[g6]=t.MIN,Dt[y6]=t.MAX;const st={[v6]:t.ZERO,[x6]:t.ONE,[_6]:t.SRC_COLOR,[dy]:t.SRC_ALPHA,[T6]:t.SRC_ALPHA_SATURATE,[M6]:t.DST_COLOR,[S6]:t.DST_ALPHA,[w6]:t.ONE_MINUS_SRC_COLOR,[hy]:t.ONE_MINUS_SRC_ALPHA,[E6]:t.ONE_MINUS_DST_COLOR,[b6]:t.ONE_MINUS_DST_ALPHA,[A6]:t.CONSTANT_COLOR,[C6]:t.ONE_MINUS_CONSTANT_COLOR,[P6]:t.CONSTANT_ALPHA,[R6]:t.ONE_MINUS_CONSTANT_ALPHA};function se(ue,Fe,ye,Ge,lt,ft,Ot,Xt,sn,Yt){if(ue===no){y===!0&&(it(t.BLEND),y=!1);return}if(y===!1&&(qe(t.BLEND),y=!0),ue!==h6){if(ue!==S||Yt!==O){if((x!==ba||w!==ba)&&(t.blendEquation(t.FUNC_ADD),x=ba,w=ba),Yt)switch(ue){case ic:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case fy:t.blendFunc(t.ONE,t.ONE);break;case GS:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case XS:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",ue);break}else switch(ue){case ic:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case fy:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case GS:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case XS:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",ue);break}g=null,_=null,T=null,N=null,L.set(0,0,0),B=0,S=ue,O=Yt}return}lt=lt||Fe,ft=ft||ye,Ot=Ot||Ge,(Fe!==x||lt!==w)&&(t.blendEquationSeparate(Dt[Fe],Dt[lt]),x=Fe,w=lt),(ye!==g||Ge!==_||ft!==T||Ot!==N)&&(t.blendFuncSeparate(st[ye],st[Ge],st[ft],st[Ot]),g=ye,_=Ge,T=ft,N=Ot),(Xt.equals(L)===!1||sn!==B)&&(t.blendColor(Xt.r,Xt.g,Xt.b,sn),L.copy(Xt),B=sn),S=ue,O=!1}function ht(ue,Fe){ue.side===ls?it(t.CULL_FACE):qe(t.CULL_FACE);let ye=ue.side===sr;Fe&&(ye=!ye),mt(ye),ue.blending===ic&&ue.transparent===!1?se(no):se(ue.blending,ue.blendEquation,ue.blendSrc,ue.blendDst,ue.blendEquationAlpha,ue.blendSrcAlpha,ue.blendDstAlpha,ue.blendColor,ue.blendAlpha,ue.premultipliedAlpha),s.setFunc(ue.depthFunc),s.setTest(ue.depthTest),s.setMask(ue.depthWrite),r.setMask(ue.colorWrite);const Ge=ue.stencilWrite;o.setTest(Ge),Ge&&(o.setMask(ue.stencilWriteMask),o.setFunc(ue.stencilFunc,ue.stencilRef,ue.stencilFuncMask),o.setOp(ue.stencilFail,ue.stencilZFail,ue.stencilZPass)),Rt(ue.polygonOffset,ue.polygonOffsetFactor,ue.polygonOffsetUnits),ue.alphaToCoverage===!0?qe(t.SAMPLE_ALPHA_TO_COVERAGE):it(t.SAMPLE_ALPHA_TO_COVERAGE)}function mt(ue){Q!==ue&&(ue?t.frontFace(t.CW):t.frontFace(t.CCW),Q=ue)}function ut(ue){ue!==u6?(qe(t.CULL_FACE),ue!==I&&(ue===WS?t.cullFace(t.BACK):ue===f6?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):it(t.CULL_FACE),I=ue}function gt(ue){ue!==F&&(ve&&t.lineWidth(ue),F=ue)}function Rt(ue,Fe,ye){ue?(qe(t.POLYGON_OFFSET_FILL),(ge!==Fe||J!==ye)&&(t.polygonOffset(Fe,ye),ge=Fe,J=ye)):it(t.POLYGON_OFFSET_FILL)}function vt(ue){ue?qe(t.SCISSOR_TEST):it(t.SCISSOR_TEST)}function re(ue){ue===void 0&&(ue=t.TEXTURE0+W-1),ee!==ue&&(t.activeTexture(ue),ee=ue)}function G(ue,Fe,ye){ye===void 0&&(ee===null?ye=t.TEXTURE0+W-1:ye=ee);let Ge=$[ye];Ge===void 0&&(Ge={type:void 0,texture:void 0},$[ye]=Ge),(Ge.type!==ue||Ge.texture!==Fe)&&(ee!==ye&&(t.activeTexture(ye),ee=ye),t.bindTexture(ue,Fe||je[ue]),Ge.type=ue,Ge.texture=Fe)}function Le(){const ue=$[ee];ue!==void 0&&ue.type!==void 0&&(t.bindTexture(ue.type,null),ue.type=void 0,ue.texture=void 0)}function et(){try{t.compressedTexImage2D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function ot(){try{t.compressedTexImage3D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function te(){try{t.texSubImage2D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function q(){try{t.texSubImage3D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function C(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function b(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function E(){try{t.texStorage2D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function R(){try{t.texStorage3D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function X(){try{t.texImage2D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function ne(){try{t.texImage3D.apply(t,arguments)}catch(ue){console.error("THREE.WebGLState:",ue)}}function he(ue){Ye.equals(ue)===!1&&(t.scissor(ue.x,ue.y,ue.z,ue.w),Ye.copy(ue))}function be(ue){ct.equals(ue)===!1&&(t.viewport(ue.x,ue.y,ue.z,ue.w),ct.copy(ue))}function nt(ue,Fe){let ye=l.get(Fe);ye===void 0&&(ye=new WeakMap,l.set(Fe,ye));let Ge=ye.get(ue);Ge===void 0&&(Ge=t.getUniformBlockIndex(Fe,ue.name),ye.set(ue,Ge))}function ze(ue,Fe){const Ge=l.get(Fe).get(ue);a.get(Fe)!==Ge&&(t.uniformBlockBinding(Fe,Ge,ue.__bindingPointIndex),a.set(Fe,Ge))}function Xe(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),c={},ee=null,$={},d={},h=new WeakMap,p=[],m=null,y=!1,S=null,x=null,g=null,_=null,w=null,T=null,N=null,L=new Pt(0,0,0),B=0,O=!1,Q=null,I=null,F=null,ge=null,J=null,Ye.set(0,0,t.canvas.width,t.canvas.height),ct.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:qe,disable:it,bindFramebuffer:bt,drawBuffers:Tt,useProgram:Nt,setBlending:se,setMaterial:ht,setFlipSided:mt,setCullFace:ut,setLineWidth:gt,setPolygonOffset:Rt,setScissorTest:vt,activeTexture:re,bindTexture:G,unbindTexture:Le,compressedTexImage2D:et,compressedTexImage3D:ot,texImage2D:X,texImage3D:ne,updateUBOMapping:nt,uniformBlockBinding:ze,texStorage2D:E,texStorage3D:R,texSubImage2D:te,texSubImage3D:q,compressedTexSubImage2D:C,compressedTexSubImage3D:b,scissor:he,viewport:be,reset:Xe}}function vY(t,e){const n=t.image&&t.image.width?t.image.width/t.image.height:1;return n>e?(t.repeat.x=1,t.repeat.y=n/e,t.offset.x=0,t.offset.y=(1-t.repeat.y)/2):(t.repeat.x=e/n,t.repeat.y=1,t.offset.x=(1-t.repeat.x)/2,t.offset.y=0),t}function xY(t,e){const n=t.image&&t.image.width?t.image.width/t.image.height:1;return n>e?(t.repeat.x=e/n,t.repeat.y=1,t.offset.x=(1-t.repeat.x)/2,t.offset.y=0):(t.repeat.x=1,t.repeat.y=n/e,t.offset.x=0,t.offset.y=(1-t.repeat.y)/2),t}function _Y(t){return t.repeat.x=1,t.repeat.y=1,t.offset.x=0,t.offset.y=0,t}function QS(t,e,n,i){const r=wY(i);switch(n){case c2:return t*e;case f2:return t*e;case d2:return t*e*2;case Op:return t*e/r.components*r.byteLength;case zp:return t*e/r.components*r.byteLength;case h2:return t*e*2/r.components*r.byteLength;case Lv:return t*e*2/r.components*r.byteLength;case u2:return t*e*3/r.components*r.byteLength;case oi:return t*e*4/r.components*r.byteLength;case Uv:return t*e*4/r.components*r.byteLength;case Ah:case Ch:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Ph:case Rh:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Sy:case My:return Math.max(t,16)*Math.max(e,8)/4;case wy:case by:return Math.max(t,8)*Math.max(e,8)/2;case Ey:case Ty:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Ay:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Cy:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Py:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case Ry:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case Iy:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case ky:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Ly:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Uy:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case By:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Ny:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Dy:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Oy:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case zy:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Fy:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Vy:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Ih:case Hy:case jy:return Math.ceil(t/4)*Math.ceil(e/4)*16;case p2:case Wy:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Gy:case Xy:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function wY(t){switch(t){case Mr:case Pv:return{byteLength:1,components:1};case Tf:case Rv:case Ti:return{byteLength:2,components:1};case Iv:case kv:return{byteLength:2,components:4};case ao:case Dp:case jn:return{byteLength:4,components:1};case l2:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}const SY={contain:vY,cover:xY,fill:_Y,getByteLength:QS};function bY(t,e,n,i,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,d=new WeakMap;let h;const p=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(re,G){return m?new OffscreenCanvas(re,G):dp("canvas")}function S(re,G,Le){let et=1;const ot=vt(re);if((ot.width>Le||ot.height>Le)&&(et=Le/Math.max(ot.width,ot.height)),et<1)if(typeof HTMLImageElement<"u"&&re instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&re instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&re instanceof ImageBitmap||typeof VideoFrame<"u"&&re instanceof VideoFrame){const te=Math.floor(et*ot.width),q=Math.floor(et*ot.height);h===void 0&&(h=y(te,q));const C=G?y(te,q):h;return C.width=te,C.height=q,C.getContext("2d").drawImage(re,0,0,te,q),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ot.width+"x"+ot.height+") to ("+te+"x"+q+")."),C}else return"data"in re&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ot.width+"x"+ot.height+")."),re;return re}function x(re){return re.generateMipmaps&&re.minFilter!==Ei&&re.minFilter!==gn}function g(re){t.generateMipmap(re)}function _(re,G,Le,et,ot=!1){if(re!==null){if(t[re]!==void 0)return t[re];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+re+"'")}let te=G;if(G===t.RED&&(Le===t.FLOAT&&(te=t.R32F),Le===t.HALF_FLOAT&&(te=t.R16F),Le===t.UNSIGNED_BYTE&&(te=t.R8)),G===t.RED_INTEGER&&(Le===t.UNSIGNED_BYTE&&(te=t.R8UI),Le===t.UNSIGNED_SHORT&&(te=t.R16UI),Le===t.UNSIGNED_INT&&(te=t.R32UI),Le===t.BYTE&&(te=t.R8I),Le===t.SHORT&&(te=t.R16I),Le===t.INT&&(te=t.R32I)),G===t.RG&&(Le===t.FLOAT&&(te=t.RG32F),Le===t.HALF_FLOAT&&(te=t.RG16F),Le===t.UNSIGNED_BYTE&&(te=t.RG8)),G===t.RG_INTEGER&&(Le===t.UNSIGNED_BYTE&&(te=t.RG8UI),Le===t.UNSIGNED_SHORT&&(te=t.RG16UI),Le===t.UNSIGNED_INT&&(te=t.RG32UI),Le===t.BYTE&&(te=t.RG8I),Le===t.SHORT&&(te=t.RG16I),Le===t.INT&&(te=t.RG32I)),G===t.RGB_INTEGER&&(Le===t.UNSIGNED_BYTE&&(te=t.RGB8UI),Le===t.UNSIGNED_SHORT&&(te=t.RGB16UI),Le===t.UNSIGNED_INT&&(te=t.RGB32UI),Le===t.BYTE&&(te=t.RGB8I),Le===t.SHORT&&(te=t.RGB16I),Le===t.INT&&(te=t.RGB32I)),G===t.RGBA_INTEGER&&(Le===t.UNSIGNED_BYTE&&(te=t.RGBA8UI),Le===t.UNSIGNED_SHORT&&(te=t.RGBA16UI),Le===t.UNSIGNED_INT&&(te=t.RGBA32UI),Le===t.BYTE&&(te=t.RGBA8I),Le===t.SHORT&&(te=t.RGBA16I),Le===t.INT&&(te=t.RGBA32I)),G===t.RGB&&Le===t.UNSIGNED_INT_5_9_9_9_REV&&(te=t.RGB9_E5),G===t.RGBA){const q=ot?ap:mn.getTransfer(et);Le===t.FLOAT&&(te=t.RGBA32F),Le===t.HALF_FLOAT&&(te=t.RGBA16F),Le===t.UNSIGNED_BYTE&&(te=q===An?t.SRGB8_ALPHA8:t.RGBA8),Le===t.UNSIGNED_SHORT_4_4_4_4&&(te=t.RGBA4),Le===t.UNSIGNED_SHORT_5_5_5_1&&(te=t.RGB5_A1)}return(te===t.R16F||te===t.R32F||te===t.RG16F||te===t.RG32F||te===t.RGBA16F||te===t.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function w(re,G){let Le;return re?G===null||G===ao||G===pc?Le=t.DEPTH24_STENCIL8:G===jn?Le=t.DEPTH32F_STENCIL8:G===Tf&&(Le=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):G===null||G===ao||G===pc?Le=t.DEPTH_COMPONENT24:G===jn?Le=t.DEPTH_COMPONENT32F:G===Tf&&(Le=t.DEPTH_COMPONENT16),Le}function T(re,G){return x(re)===!0||re.isFramebufferTexture&&re.minFilter!==Ei&&re.minFilter!==gn?Math.log2(Math.max(G.width,G.height))+1:re.mipmaps!==void 0&&re.mipmaps.length>0?re.mipmaps.length:re.isCompressedTexture&&Array.isArray(re.image)?G.mipmaps.length:1}function N(re){const G=re.target;G.removeEventListener("dispose",N),B(G),G.isVideoTexture&&d.delete(G)}function L(re){const G=re.target;G.removeEventListener("dispose",L),Q(G)}function B(re){const G=i.get(re);if(G.__webglInit===void 0)return;const Le=re.source,et=p.get(Le);if(et){const ot=et[G.__cacheKey];ot.usedTimes--,ot.usedTimes===0&&O(re),Object.keys(et).length===0&&p.delete(Le)}i.remove(re)}function O(re){const G=i.get(re);t.deleteTexture(G.__webglTexture);const Le=re.source,et=p.get(Le);delete et[G.__cacheKey],o.memory.textures--}function Q(re){const G=i.get(re);if(re.depthTexture&&re.depthTexture.dispose(),re.isWebGLCubeRenderTarget)for(let et=0;et<6;et++){if(Array.isArray(G.__webglFramebuffer[et]))for(let ot=0;ot<G.__webglFramebuffer[et].length;ot++)t.deleteFramebuffer(G.__webglFramebuffer[et][ot]);else t.deleteFramebuffer(G.__webglFramebuffer[et]);G.__webglDepthbuffer&&t.deleteRenderbuffer(G.__webglDepthbuffer[et])}else{if(Array.isArray(G.__webglFramebuffer))for(let et=0;et<G.__webglFramebuffer.length;et++)t.deleteFramebuffer(G.__webglFramebuffer[et]);else t.deleteFramebuffer(G.__webglFramebuffer);if(G.__webglDepthbuffer&&t.deleteRenderbuffer(G.__webglDepthbuffer),G.__webglMultisampledFramebuffer&&t.deleteFramebuffer(G.__webglMultisampledFramebuffer),G.__webglColorRenderbuffer)for(let et=0;et<G.__webglColorRenderbuffer.length;et++)G.__webglColorRenderbuffer[et]&&t.deleteRenderbuffer(G.__webglColorRenderbuffer[et]);G.__webglDepthRenderbuffer&&t.deleteRenderbuffer(G.__webglDepthRenderbuffer)}const Le=re.textures;for(let et=0,ot=Le.length;et<ot;et++){const te=i.get(Le[et]);te.__webglTexture&&(t.deleteTexture(te.__webglTexture),o.memory.textures--),i.remove(Le[et])}i.remove(re)}let I=0;function F(){I=0}function ge(){const re=I;return re>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+re+" texture units while this GPU supports only "+r.maxTextures),I+=1,re}function J(re){const G=[];return G.push(re.wrapS),G.push(re.wrapT),G.push(re.wrapR||0),G.push(re.magFilter),G.push(re.minFilter),G.push(re.anisotropy),G.push(re.internalFormat),G.push(re.format),G.push(re.type),G.push(re.generateMipmaps),G.push(re.premultiplyAlpha),G.push(re.flipY),G.push(re.unpackAlignment),G.push(re.colorSpace),G.join()}function W(re,G){const Le=i.get(re);if(re.isVideoTexture&&gt(re),re.isRenderTargetTexture===!1&&re.version>0&&Le.__version!==re.version){const et=re.image;if(et===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(et.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ct(Le,re,G);return}}n.bindTexture(t.TEXTURE_2D,Le.__webglTexture,t.TEXTURE0+G)}function ve(re,G){const Le=i.get(re);if(re.version>0&&Le.__version!==re.version){ct(Le,re,G);return}n.bindTexture(t.TEXTURE_2D_ARRAY,Le.__webglTexture,t.TEXTURE0+G)}function le(re,G){const Le=i.get(re);if(re.version>0&&Le.__version!==re.version){ct(Le,re,G);return}n.bindTexture(t.TEXTURE_3D,Le.__webglTexture,t.TEXTURE0+G)}function ke(re,G){const Le=i.get(re);if(re.version>0&&Le.__version!==re.version){De(Le,re,G);return}n.bindTexture(t.TEXTURE_CUBE_MAP,Le.__webglTexture,t.TEXTURE0+G)}const ee={[Ef]:t.REPEAT,[si]:t.CLAMP_TO_EDGE,[rp]:t.MIRRORED_REPEAT},$={[Ei]:t.NEAREST,[a2]:t.NEAREST_MIPMAP_NEAREST,[Ju]:t.NEAREST_MIPMAP_LINEAR,[gn]:t.LINEAR,[Th]:t.LINEAR_MIPMAP_NEAREST,[Ys]:t.LINEAR_MIPMAP_LINEAR},_e={[X6]:t.NEVER,[J6]:t.ALWAYS,[q6]:t.LESS,[g2]:t.LEQUAL,[Y6]:t.EQUAL,[Z6]:t.GEQUAL,[$6]:t.GREATER,[K6]:t.NOTEQUAL};function Ce(re,G){if(G.type===jn&&e.has("OES_texture_float_linear")===!1&&(G.magFilter===gn||G.magFilter===Th||G.magFilter===Ju||G.magFilter===Ys||G.minFilter===gn||G.minFilter===Th||G.minFilter===Ju||G.minFilter===Ys)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(re,t.TEXTURE_WRAP_S,ee[G.wrapS]),t.texParameteri(re,t.TEXTURE_WRAP_T,ee[G.wrapT]),(re===t.TEXTURE_3D||re===t.TEXTURE_2D_ARRAY)&&t.texParameteri(re,t.TEXTURE_WRAP_R,ee[G.wrapR]),t.texParameteri(re,t.TEXTURE_MAG_FILTER,$[G.magFilter]),t.texParameteri(re,t.TEXTURE_MIN_FILTER,$[G.minFilter]),G.compareFunction&&(t.texParameteri(re,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(re,t.TEXTURE_COMPARE_FUNC,_e[G.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(G.magFilter===Ei||G.minFilter!==Ju&&G.minFilter!==Ys||G.type===jn&&e.has("OES_texture_float_linear")===!1)return;if(G.anisotropy>1||i.get(G).__currentAnisotropy){const Le=e.get("EXT_texture_filter_anisotropic");t.texParameterf(re,Le.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(G.anisotropy,r.getMaxAnisotropy())),i.get(G).__currentAnisotropy=G.anisotropy}}}function Ye(re,G){let Le=!1;re.__webglInit===void 0&&(re.__webglInit=!0,G.addEventListener("dispose",N));const et=G.source;let ot=p.get(et);ot===void 0&&(ot={},p.set(et,ot));const te=J(G);if(te!==re.__cacheKey){ot[te]===void 0&&(ot[te]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,Le=!0),ot[te].usedTimes++;const q=ot[re.__cacheKey];q!==void 0&&(ot[re.__cacheKey].usedTimes--,q.usedTimes===0&&O(G)),re.__cacheKey=te,re.__webglTexture=ot[te].texture}return Le}function ct(re,G,Le){let et=t.TEXTURE_2D;(G.isDataArrayTexture||G.isCompressedArrayTexture)&&(et=t.TEXTURE_2D_ARRAY),G.isData3DTexture&&(et=t.TEXTURE_3D);const ot=Ye(re,G),te=G.source;n.bindTexture(et,re.__webglTexture,t.TEXTURE0+Le);const q=i.get(te);if(te.version!==q.__version||ot===!0){n.activeTexture(t.TEXTURE0+Le);const C=mn.getPrimaries(mn.workingColorSpace),b=G.colorSpace===qs?null:mn.getPrimaries(G.colorSpace),E=G.colorSpace===qs||C===b?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,G.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,G.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,E);let R=S(G.image,!1,r.maxTextureSize);R=Rt(G,R);const X=s.convert(G.format,G.colorSpace),ne=s.convert(G.type);let he=_(G.internalFormat,X,ne,G.colorSpace,G.isVideoTexture);Ce(et,G);let be;const nt=G.mipmaps,ze=G.isVideoTexture!==!0,Xe=q.__version===void 0||ot===!0,ue=te.dataReady,Fe=T(G,R);if(G.isDepthTexture)he=w(G.format===mc,G.type),Xe&&(ze?n.texStorage2D(t.TEXTURE_2D,1,he,R.width,R.height):n.texImage2D(t.TEXTURE_2D,0,he,R.width,R.height,0,X,ne,null));else if(G.isDataTexture)if(nt.length>0){ze&&Xe&&n.texStorage2D(t.TEXTURE_2D,Fe,he,nt[0].width,nt[0].height);for(let ye=0,Ge=nt.length;ye<Ge;ye++)be=nt[ye],ze?ue&&n.texSubImage2D(t.TEXTURE_2D,ye,0,0,be.width,be.height,X,ne,be.data):n.texImage2D(t.TEXTURE_2D,ye,he,be.width,be.height,0,X,ne,be.data);G.generateMipmaps=!1}else ze?(Xe&&n.texStorage2D(t.TEXTURE_2D,Fe,he,R.width,R.height),ue&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,R.width,R.height,X,ne,R.data)):n.texImage2D(t.TEXTURE_2D,0,he,R.width,R.height,0,X,ne,R.data);else if(G.isCompressedTexture)if(G.isCompressedArrayTexture){ze&&Xe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,Fe,he,nt[0].width,nt[0].height,R.depth);for(let ye=0,Ge=nt.length;ye<Ge;ye++)if(be=nt[ye],G.format!==oi)if(X!==null)if(ze){if(ue)if(G.layerUpdates.size>0){const lt=QS(be.width,be.height,G.format,G.type);for(const ft of G.layerUpdates){const Ot=be.data.subarray(ft*lt/be.data.BYTES_PER_ELEMENT,(ft+1)*lt/be.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,ye,0,0,ft,be.width,be.height,1,X,Ot,0,0)}G.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,ye,0,0,0,be.width,be.height,R.depth,X,be.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,ye,he,be.width,be.height,R.depth,0,be.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?ue&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,ye,0,0,0,be.width,be.height,R.depth,X,ne,be.data):n.texImage3D(t.TEXTURE_2D_ARRAY,ye,he,be.width,be.height,R.depth,0,X,ne,be.data)}else{ze&&Xe&&n.texStorage2D(t.TEXTURE_2D,Fe,he,nt[0].width,nt[0].height);for(let ye=0,Ge=nt.length;ye<Ge;ye++)be=nt[ye],G.format!==oi?X!==null?ze?ue&&n.compressedTexSubImage2D(t.TEXTURE_2D,ye,0,0,be.width,be.height,X,be.data):n.compressedTexImage2D(t.TEXTURE_2D,ye,he,be.width,be.height,0,be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?ue&&n.texSubImage2D(t.TEXTURE_2D,ye,0,0,be.width,be.height,X,ne,be.data):n.texImage2D(t.TEXTURE_2D,ye,he,be.width,be.height,0,X,ne,be.data)}else if(G.isDataArrayTexture)if(ze){if(Xe&&n.texStorage3D(t.TEXTURE_2D_ARRAY,Fe,he,R.width,R.height,R.depth),ue)if(G.layerUpdates.size>0){const ye=QS(R.width,R.height,G.format,G.type);for(const Ge of G.layerUpdates){const lt=R.data.subarray(Ge*ye/R.data.BYTES_PER_ELEMENT,(Ge+1)*ye/R.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Ge,R.width,R.height,1,X,ne,lt)}G.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,R.width,R.height,R.depth,X,ne,R.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,he,R.width,R.height,R.depth,0,X,ne,R.data);else if(G.isData3DTexture)ze?(Xe&&n.texStorage3D(t.TEXTURE_3D,Fe,he,R.width,R.height,R.depth),ue&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,R.width,R.height,R.depth,X,ne,R.data)):n.texImage3D(t.TEXTURE_3D,0,he,R.width,R.height,R.depth,0,X,ne,R.data);else if(G.isFramebufferTexture){if(Xe)if(ze)n.texStorage2D(t.TEXTURE_2D,Fe,he,R.width,R.height);else{let ye=R.width,Ge=R.height;for(let lt=0;lt<Fe;lt++)n.texImage2D(t.TEXTURE_2D,lt,he,ye,Ge,0,X,ne,null),ye>>=1,Ge>>=1}}else if(nt.length>0){if(ze&&Xe){const ye=vt(nt[0]);n.texStorage2D(t.TEXTURE_2D,Fe,he,ye.width,ye.height)}for(let ye=0,Ge=nt.length;ye<Ge;ye++)be=nt[ye],ze?ue&&n.texSubImage2D(t.TEXTURE_2D,ye,0,0,X,ne,be):n.texImage2D(t.TEXTURE_2D,ye,he,X,ne,be);G.generateMipmaps=!1}else if(ze){if(Xe){const ye=vt(R);n.texStorage2D(t.TEXTURE_2D,Fe,he,ye.width,ye.height)}ue&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,X,ne,R)}else n.texImage2D(t.TEXTURE_2D,0,he,X,ne,R);x(G)&&g(et),q.__version=te.version,G.onUpdate&&G.onUpdate(G)}re.__version=G.version}function De(re,G,Le){if(G.image.length!==6)return;const et=Ye(re,G),ot=G.source;n.bindTexture(t.TEXTURE_CUBE_MAP,re.__webglTexture,t.TEXTURE0+Le);const te=i.get(ot);if(ot.version!==te.__version||et===!0){n.activeTexture(t.TEXTURE0+Le);const q=mn.getPrimaries(mn.workingColorSpace),C=G.colorSpace===qs?null:mn.getPrimaries(G.colorSpace),b=G.colorSpace===qs||q===C?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,G.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,G.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,b);const E=G.isCompressedTexture||G.image[0].isCompressedTexture,R=G.image[0]&&G.image[0].isDataTexture,X=[];for(let Ge=0;Ge<6;Ge++)!E&&!R?X[Ge]=S(G.image[Ge],!0,r.maxCubemapSize):X[Ge]=R?G.image[Ge].image:G.image[Ge],X[Ge]=Rt(G,X[Ge]);const ne=X[0],he=s.convert(G.format,G.colorSpace),be=s.convert(G.type),nt=_(G.internalFormat,he,be,G.colorSpace),ze=G.isVideoTexture!==!0,Xe=te.__version===void 0||et===!0,ue=ot.dataReady;let Fe=T(G,ne);Ce(t.TEXTURE_CUBE_MAP,G);let ye;if(E){ze&&Xe&&n.texStorage2D(t.TEXTURE_CUBE_MAP,Fe,nt,ne.width,ne.height);for(let Ge=0;Ge<6;Ge++){ye=X[Ge].mipmaps;for(let lt=0;lt<ye.length;lt++){const ft=ye[lt];G.format!==oi?he!==null?ze?ue&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt,0,0,ft.width,ft.height,he,ft.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt,nt,ft.width,ft.height,0,ft.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ze?ue&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt,0,0,ft.width,ft.height,he,be,ft.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt,nt,ft.width,ft.height,0,he,be,ft.data)}}}else{if(ye=G.mipmaps,ze&&Xe){ye.length>0&&Fe++;const Ge=vt(X[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,Fe,nt,Ge.width,Ge.height)}for(let Ge=0;Ge<6;Ge++)if(R){ze?ue&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,0,0,0,X[Ge].width,X[Ge].height,he,be,X[Ge].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,0,nt,X[Ge].width,X[Ge].height,0,he,be,X[Ge].data);for(let lt=0;lt<ye.length;lt++){const Ot=ye[lt].image[Ge].image;ze?ue&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt+1,0,0,Ot.width,Ot.height,he,be,Ot.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt+1,nt,Ot.width,Ot.height,0,he,be,Ot.data)}}else{ze?ue&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,0,0,0,he,be,X[Ge]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,0,nt,he,be,X[Ge]);for(let lt=0;lt<ye.length;lt++){const ft=ye[lt];ze?ue&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt+1,0,0,he,be,ft.image[Ge]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Ge,lt+1,nt,he,be,ft.image[Ge])}}}x(G)&&g(t.TEXTURE_CUBE_MAP),te.__version=ot.version,G.onUpdate&&G.onUpdate(G)}re.__version=G.version}function je(re,G,Le,et,ot,te){const q=s.convert(Le.format,Le.colorSpace),C=s.convert(Le.type),b=_(Le.internalFormat,q,C,Le.colorSpace);if(!i.get(G).__hasExternalTextures){const R=Math.max(1,G.width>>te),X=Math.max(1,G.height>>te);ot===t.TEXTURE_3D||ot===t.TEXTURE_2D_ARRAY?n.texImage3D(ot,te,b,R,X,G.depth,0,q,C,null):n.texImage2D(ot,te,b,R,X,0,q,C,null)}n.bindFramebuffer(t.FRAMEBUFFER,re),ut(G)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,et,ot,i.get(Le).__webglTexture,0,mt(G)):(ot===t.TEXTURE_2D||ot>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ot<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,et,ot,i.get(Le).__webglTexture,te),n.bindFramebuffer(t.FRAMEBUFFER,null)}function qe(re,G,Le){if(t.bindRenderbuffer(t.RENDERBUFFER,re),G.depthBuffer){const et=G.depthTexture,ot=et&&et.isDepthTexture?et.type:null,te=w(G.stencilBuffer,ot),q=G.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,C=mt(G);ut(G)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,C,te,G.width,G.height):Le?t.renderbufferStorageMultisample(t.RENDERBUFFER,C,te,G.width,G.height):t.renderbufferStorage(t.RENDERBUFFER,te,G.width,G.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,q,t.RENDERBUFFER,re)}else{const et=G.textures;for(let ot=0;ot<et.length;ot++){const te=et[ot],q=s.convert(te.format,te.colorSpace),C=s.convert(te.type),b=_(te.internalFormat,q,C,te.colorSpace),E=mt(G);Le&&ut(G)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,E,b,G.width,G.height):ut(G)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,E,b,G.width,G.height):t.renderbufferStorage(t.RENDERBUFFER,b,G.width,G.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function it(re,G){if(G&&G.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,re),!(G.depthTexture&&G.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(G.depthTexture).__webglTexture||G.depthTexture.image.width!==G.width||G.depthTexture.image.height!==G.height)&&(G.depthTexture.image.width=G.width,G.depthTexture.image.height=G.height,G.depthTexture.needsUpdate=!0),W(G.depthTexture,0);const et=i.get(G.depthTexture).__webglTexture,ot=mt(G);if(G.depthTexture.format===rc)ut(G)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,et,0,ot):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,et,0);else if(G.depthTexture.format===mc)ut(G)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,et,0,ot):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function bt(re){const G=i.get(re),Le=re.isWebGLCubeRenderTarget===!0;if(G.__boundDepthTexture!==re.depthTexture){const et=re.depthTexture;if(G.__depthDisposeCallback&&G.__depthDisposeCallback(),et){const ot=()=>{delete G.__boundDepthTexture,delete G.__depthDisposeCallback,et.removeEventListener("dispose",ot)};et.addEventListener("dispose",ot),G.__depthDisposeCallback=ot}G.__boundDepthTexture=et}if(re.depthTexture&&!G.__autoAllocateDepthBuffer){if(Le)throw new Error("target.depthTexture not supported in Cube render targets");it(G.__webglFramebuffer,re)}else if(Le){G.__webglDepthbuffer=[];for(let et=0;et<6;et++)if(n.bindFramebuffer(t.FRAMEBUFFER,G.__webglFramebuffer[et]),G.__webglDepthbuffer[et]===void 0)G.__webglDepthbuffer[et]=t.createRenderbuffer(),qe(G.__webglDepthbuffer[et],re,!1);else{const ot=re.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,te=G.__webglDepthbuffer[et];t.bindRenderbuffer(t.RENDERBUFFER,te),t.framebufferRenderbuffer(t.FRAMEBUFFER,ot,t.RENDERBUFFER,te)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,G.__webglFramebuffer),G.__webglDepthbuffer===void 0)G.__webglDepthbuffer=t.createRenderbuffer(),qe(G.__webglDepthbuffer,re,!1);else{const et=re.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ot=G.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ot),t.framebufferRenderbuffer(t.FRAMEBUFFER,et,t.RENDERBUFFER,ot)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function Tt(re,G,Le){const et=i.get(re);G!==void 0&&je(et.__webglFramebuffer,re,re.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),Le!==void 0&&bt(re)}function Nt(re){const G=re.texture,Le=i.get(re),et=i.get(G);re.addEventListener("dispose",L);const ot=re.textures,te=re.isWebGLCubeRenderTarget===!0,q=ot.length>1;if(q||(et.__webglTexture===void 0&&(et.__webglTexture=t.createTexture()),et.__version=G.version,o.memory.textures++),te){Le.__webglFramebuffer=[];for(let C=0;C<6;C++)if(G.mipmaps&&G.mipmaps.length>0){Le.__webglFramebuffer[C]=[];for(let b=0;b<G.mipmaps.length;b++)Le.__webglFramebuffer[C][b]=t.createFramebuffer()}else Le.__webglFramebuffer[C]=t.createFramebuffer()}else{if(G.mipmaps&&G.mipmaps.length>0){Le.__webglFramebuffer=[];for(let C=0;C<G.mipmaps.length;C++)Le.__webglFramebuffer[C]=t.createFramebuffer()}else Le.__webglFramebuffer=t.createFramebuffer();if(q)for(let C=0,b=ot.length;C<b;C++){const E=i.get(ot[C]);E.__webglTexture===void 0&&(E.__webglTexture=t.createTexture(),o.memory.textures++)}if(re.samples>0&&ut(re)===!1){Le.__webglMultisampledFramebuffer=t.createFramebuffer(),Le.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,Le.__webglMultisampledFramebuffer);for(let C=0;C<ot.length;C++){const b=ot[C];Le.__webglColorRenderbuffer[C]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,Le.__webglColorRenderbuffer[C]);const E=s.convert(b.format,b.colorSpace),R=s.convert(b.type),X=_(b.internalFormat,E,R,b.colorSpace,re.isXRRenderTarget===!0),ne=mt(re);t.renderbufferStorageMultisample(t.RENDERBUFFER,ne,X,re.width,re.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+C,t.RENDERBUFFER,Le.__webglColorRenderbuffer[C])}t.bindRenderbuffer(t.RENDERBUFFER,null),re.depthBuffer&&(Le.__webglDepthRenderbuffer=t.createRenderbuffer(),qe(Le.__webglDepthRenderbuffer,re,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(te){n.bindTexture(t.TEXTURE_CUBE_MAP,et.__webglTexture),Ce(t.TEXTURE_CUBE_MAP,G);for(let C=0;C<6;C++)if(G.mipmaps&&G.mipmaps.length>0)for(let b=0;b<G.mipmaps.length;b++)je(Le.__webglFramebuffer[C][b],re,G,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+C,b);else je(Le.__webglFramebuffer[C],re,G,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+C,0);x(G)&&g(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(q){for(let C=0,b=ot.length;C<b;C++){const E=ot[C],R=i.get(E);n.bindTexture(t.TEXTURE_2D,R.__webglTexture),Ce(t.TEXTURE_2D,E),je(Le.__webglFramebuffer,re,E,t.COLOR_ATTACHMENT0+C,t.TEXTURE_2D,0),x(E)&&g(t.TEXTURE_2D)}n.unbindTexture()}else{let C=t.TEXTURE_2D;if((re.isWebGL3DRenderTarget||re.isWebGLArrayRenderTarget)&&(C=re.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(C,et.__webglTexture),Ce(C,G),G.mipmaps&&G.mipmaps.length>0)for(let b=0;b<G.mipmaps.length;b++)je(Le.__webglFramebuffer[b],re,G,t.COLOR_ATTACHMENT0,C,b);else je(Le.__webglFramebuffer,re,G,t.COLOR_ATTACHMENT0,C,0);x(G)&&g(C),n.unbindTexture()}re.depthBuffer&&bt(re)}function Dt(re){const G=re.textures;for(let Le=0,et=G.length;Le<et;Le++){const ot=G[Le];if(x(ot)){const te=re.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,q=i.get(ot).__webglTexture;n.bindTexture(te,q),g(te),n.unbindTexture()}}}const st=[],se=[];function ht(re){if(re.samples>0){if(ut(re)===!1){const G=re.textures,Le=re.width,et=re.height;let ot=t.COLOR_BUFFER_BIT;const te=re.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,q=i.get(re),C=G.length>1;if(C)for(let b=0;b<G.length;b++)n.bindFramebuffer(t.FRAMEBUFFER,q.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+b,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,q.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+b,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,q.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,q.__webglFramebuffer);for(let b=0;b<G.length;b++){if(re.resolveDepthBuffer&&(re.depthBuffer&&(ot|=t.DEPTH_BUFFER_BIT),re.stencilBuffer&&re.resolveStencilBuffer&&(ot|=t.STENCIL_BUFFER_BIT)),C){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,q.__webglColorRenderbuffer[b]);const E=i.get(G[b]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,E,0)}t.blitFramebuffer(0,0,Le,et,0,0,Le,et,ot,t.NEAREST),l===!0&&(st.length=0,se.length=0,st.push(t.COLOR_ATTACHMENT0+b),re.depthBuffer&&re.resolveDepthBuffer===!1&&(st.push(te),se.push(te),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,se)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,st))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),C)for(let b=0;b<G.length;b++){n.bindFramebuffer(t.FRAMEBUFFER,q.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+b,t.RENDERBUFFER,q.__webglColorRenderbuffer[b]);const E=i.get(G[b]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,q.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+b,t.TEXTURE_2D,E,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,q.__webglMultisampledFramebuffer)}else if(re.depthBuffer&&re.resolveDepthBuffer===!1&&l){const G=re.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[G])}}}function mt(re){return Math.min(r.maxSamples,re.samples)}function ut(re){const G=i.get(re);return re.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&G.__useRenderToTexture!==!1}function gt(re){const G=o.render.frame;d.get(re)!==G&&(d.set(re,G),re.update())}function Rt(re,G){const Le=re.colorSpace,et=re.format,ot=re.type;return re.isCompressedTexture===!0||re.isVideoTexture===!0||Le!==ps&&Le!==qs&&(mn.getTransfer(Le)===An?(et!==oi||ot!==Mr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Le)),G}function vt(re){return typeof HTMLImageElement<"u"&&re instanceof HTMLImageElement?(c.width=re.naturalWidth||re.width,c.height=re.naturalHeight||re.height):typeof VideoFrame<"u"&&re instanceof VideoFrame?(c.width=re.displayWidth,c.height=re.displayHeight):(c.width=re.width,c.height=re.height),c}this.allocateTextureUnit=ge,this.resetTextureUnits=F,this.setTexture2D=W,this.setTexture2DArray=ve,this.setTexture3D=le,this.setTextureCube=ke,this.rebindTextures=Tt,this.setupRenderTarget=Nt,this.updateRenderTargetMipmap=Dt,this.updateMultisampleRenderTarget=ht,this.setupDepthRenderbuffer=bt,this.setupFrameBufferTexture=je,this.useMultisampledRTT=ut}function dL(t,e){function n(i,r=qs){let s;const o=mn.getTransfer(r);if(i===Mr)return t.UNSIGNED_BYTE;if(i===Iv)return t.UNSIGNED_SHORT_4_4_4_4;if(i===kv)return t.UNSIGNED_SHORT_5_5_5_1;if(i===l2)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Pv)return t.BYTE;if(i===Rv)return t.SHORT;if(i===Tf)return t.UNSIGNED_SHORT;if(i===Dp)return t.INT;if(i===ao)return t.UNSIGNED_INT;if(i===jn)return t.FLOAT;if(i===Ti)return t.HALF_FLOAT;if(i===c2)return t.ALPHA;if(i===u2)return t.RGB;if(i===oi)return t.RGBA;if(i===f2)return t.LUMINANCE;if(i===d2)return t.LUMINANCE_ALPHA;if(i===rc)return t.DEPTH_COMPONENT;if(i===mc)return t.DEPTH_STENCIL;if(i===Op)return t.RED;if(i===zp)return t.RED_INTEGER;if(i===h2)return t.RG;if(i===Lv)return t.RG_INTEGER;if(i===Uv)return t.RGBA_INTEGER;if(i===Ah||i===Ch||i===Ph||i===Rh)if(o===An)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Ah)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ch)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ph)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Rh)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Ah)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ch)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ph)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Rh)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===wy||i===Sy||i===by||i===My)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===wy)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Sy)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===by)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===My)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ey||i===Ty||i===Ay)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Ey||i===Ty)return o===An?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Ay)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Cy||i===Py||i===Ry||i===Iy||i===ky||i===Ly||i===Uy||i===By||i===Ny||i===Dy||i===Oy||i===zy||i===Fy||i===Vy)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Cy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Py)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ry)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Iy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ky)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ly)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Uy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===By)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ny)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Dy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Oy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===zy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Fy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Vy)return o===An?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ih||i===Hy||i===jy)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Ih)return o===An?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Hy)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===jy)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===p2||i===Wy||i===Gy||i===Xy)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ih)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Wy)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Gy)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Xy)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===pc?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class hL extends Mi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class tf extends fn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const MY={type:"move"};class Y_{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new tf,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new tf,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ce,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ce),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new tf,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ce,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ce),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const S of e.hand.values()){const x=n.getJointPose(S,i),g=this._getHandJoint(c,S);x!==null&&(g.matrix.fromArray(x.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=x.radius),g.visible=x!==null}const d=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],p=d.position.distanceTo(h.position),m=.02,y=.005;c.inputState.pinching&&p>m+y?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=m-y&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(MY)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new tf;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const EY=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,TY=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class AY{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new yn,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new Er({vertexShader:EY,fragmentShader:TY,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Wn(new rl(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class CY extends uo{constructor(e,n){super();const i=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,d=null,h=null,p=null,m=null,y=null;const S=new AY,x=n.getContextAttributes();let g=null,_=null;const w=[],T=[],N=new at;let L=null;const B=new Mi;B.layers.enable(1),B.viewport=new cn;const O=new Mi;O.layers.enable(2),O.viewport=new cn;const Q=[B,O],I=new hL;I.layers.enable(1),I.layers.enable(2);let F=null,ge=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(De){let je=w[De];return je===void 0&&(je=new Y_,w[De]=je),je.getTargetRaySpace()},this.getControllerGrip=function(De){let je=w[De];return je===void 0&&(je=new Y_,w[De]=je),je.getGripSpace()},this.getHand=function(De){let je=w[De];return je===void 0&&(je=new Y_,w[De]=je),je.getHandSpace()};function J(De){const je=T.indexOf(De.inputSource);if(je===-1)return;const qe=w[je];qe!==void 0&&(qe.update(De.inputSource,De.frame,c||o),qe.dispatchEvent({type:De.type,data:De.inputSource}))}function W(){r.removeEventListener("select",J),r.removeEventListener("selectstart",J),r.removeEventListener("selectend",J),r.removeEventListener("squeeze",J),r.removeEventListener("squeezestart",J),r.removeEventListener("squeezeend",J),r.removeEventListener("end",W),r.removeEventListener("inputsourceschange",ve);for(let De=0;De<w.length;De++){const je=T[De];je!==null&&(T[De]=null,w[De].disconnect(je))}F=null,ge=null,S.reset(),e.setRenderTarget(g),m=null,p=null,h=null,r=null,_=null,ct.stop(),i.isPresenting=!1,e.setPixelRatio(L),e.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(De){s=De,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(De){a=De,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(De){c=De},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return h},this.getFrame=function(){return y},this.getSession=function(){return r},this.setSession=async function(De){if(r=De,r!==null){if(g=e.getRenderTarget(),r.addEventListener("select",J),r.addEventListener("selectstart",J),r.addEventListener("selectend",J),r.addEventListener("squeeze",J),r.addEventListener("squeezestart",J),r.addEventListener("squeezeend",J),r.addEventListener("end",W),r.addEventListener("inputsourceschange",ve),x.xrCompatible!==!0&&await n.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(N),r.renderState.layers===void 0){const je={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};m=new XRWebGLLayer(r,n,je),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),_=new jr(m.framebufferWidth,m.framebufferHeight,{format:oi,type:Mr,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let je=null,qe=null,it=null;x.depth&&(it=x.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,je=x.stencil?mc:rc,qe=x.stencil?pc:ao);const bt={colorFormat:n.RGBA8,depthFormat:it,scaleFactor:s};h=new XRWebGLBinding(r,n),p=h.createProjectionLayer(bt),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),_=new jr(p.textureWidth,p.textureHeight,{format:oi,type:Mr,depthTexture:new b2(p.textureWidth,p.textureHeight,qe,void 0,void 0,void 0,void 0,void 0,void 0,je),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),ct.setContext(r),ct.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function ve(De){for(let je=0;je<De.removed.length;je++){const qe=De.removed[je],it=T.indexOf(qe);it>=0&&(T[it]=null,w[it].disconnect(qe))}for(let je=0;je<De.added.length;je++){const qe=De.added[je];let it=T.indexOf(qe);if(it===-1){for(let Tt=0;Tt<w.length;Tt++)if(Tt>=T.length){T.push(qe),it=Tt;break}else if(T[Tt]===null){T[Tt]=qe,it=Tt;break}if(it===-1)break}const bt=w[it];bt&&bt.connect(qe)}}const le=new ce,ke=new ce;function ee(De,je,qe){le.setFromMatrixPosition(je.matrixWorld),ke.setFromMatrixPosition(qe.matrixWorld);const it=le.distanceTo(ke),bt=je.projectionMatrix.elements,Tt=qe.projectionMatrix.elements,Nt=bt[14]/(bt[10]-1),Dt=bt[14]/(bt[10]+1),st=(bt[9]+1)/bt[5],se=(bt[9]-1)/bt[5],ht=(bt[8]-1)/bt[0],mt=(Tt[8]+1)/Tt[0],ut=Nt*ht,gt=Nt*mt,Rt=it/(-ht+mt),vt=Rt*-ht;if(je.matrixWorld.decompose(De.position,De.quaternion,De.scale),De.translateX(vt),De.translateZ(Rt),De.matrixWorld.compose(De.position,De.quaternion,De.scale),De.matrixWorldInverse.copy(De.matrixWorld).invert(),bt[10]===-1)De.projectionMatrix.copy(je.projectionMatrix),De.projectionMatrixInverse.copy(je.projectionMatrixInverse);else{const re=Nt+Rt,G=Dt+Rt,Le=ut-vt,et=gt+(it-vt),ot=st*Dt/G*re,te=se*Dt/G*re;De.projectionMatrix.makePerspective(Le,et,ot,te,re,G),De.projectionMatrixInverse.copy(De.projectionMatrix).invert()}}function $(De,je){je===null?De.matrixWorld.copy(De.matrix):De.matrixWorld.multiplyMatrices(je.matrixWorld,De.matrix),De.matrixWorldInverse.copy(De.matrixWorld).invert()}this.updateCamera=function(De){if(r===null)return;let je=De.near,qe=De.far;S.texture!==null&&(S.depthNear>0&&(je=S.depthNear),S.depthFar>0&&(qe=S.depthFar)),I.near=O.near=B.near=je,I.far=O.far=B.far=qe,(F!==I.near||ge!==I.far)&&(r.updateRenderState({depthNear:I.near,depthFar:I.far}),F=I.near,ge=I.far);const it=De.parent,bt=I.cameras;$(I,it);for(let Tt=0;Tt<bt.length;Tt++)$(bt[Tt],it);bt.length===2?ee(I,B,O):I.projectionMatrix.copy(B.projectionMatrix),_e(De,I,it)};function _e(De,je,qe){qe===null?De.matrix.copy(je.matrixWorld):(De.matrix.copy(qe.matrixWorld),De.matrix.invert(),De.matrix.multiply(je.matrixWorld)),De.matrix.decompose(De.position,De.quaternion,De.scale),De.updateMatrixWorld(!0),De.projectionMatrix.copy(je.projectionMatrix),De.projectionMatrixInverse.copy(je.projectionMatrixInverse),De.isPerspectiveCamera&&(De.fov=Af*2*Math.atan(1/De.projectionMatrix.elements[5]),De.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(p===null&&m===null))return l},this.setFoveation=function(De){l=De,p!==null&&(p.fixedFoveation=De),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=De)},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(I)};let Ce=null;function Ye(De,je){if(d=je.getViewerPose(c||o),y=je,d!==null){const qe=d.views;m!==null&&(e.setRenderTargetFramebuffer(_,m.framebuffer),e.setRenderTarget(_));let it=!1;qe.length!==I.cameras.length&&(I.cameras.length=0,it=!0);for(let Tt=0;Tt<qe.length;Tt++){const Nt=qe[Tt];let Dt=null;if(m!==null)Dt=m.getViewport(Nt);else{const se=h.getViewSubImage(p,Nt);Dt=se.viewport,Tt===0&&(e.setRenderTargetTextures(_,se.colorTexture,p.ignoreDepthValues?void 0:se.depthStencilTexture),e.setRenderTarget(_))}let st=Q[Tt];st===void 0&&(st=new Mi,st.layers.enable(Tt),st.viewport=new cn,Q[Tt]=st),st.matrix.fromArray(Nt.transform.matrix),st.matrix.decompose(st.position,st.quaternion,st.scale),st.projectionMatrix.fromArray(Nt.projectionMatrix),st.projectionMatrixInverse.copy(st.projectionMatrix).invert(),st.viewport.set(Dt.x,Dt.y,Dt.width,Dt.height),Tt===0&&(I.matrix.copy(st.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),it===!0&&I.cameras.push(st)}const bt=r.enabledFeatures;if(bt&&bt.includes("depth-sensing")){const Tt=h.getDepthInformation(qe[0]);Tt&&Tt.isValid&&Tt.texture&&S.init(e,Tt,r.renderState)}}for(let qe=0;qe<w.length;qe++){const it=T[qe],bt=w[qe];it!==null&&bt!==void 0&&bt.update(it,je,c||o)}Ce&&Ce(De,je),je.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:je}),y=null}const ct=new aL;ct.setAnimationLoop(Ye),this.setAnimationLoop=function(De){Ce=De},this.dispose=function(){}}}const Ml=new Wr,PY=new Wt;function RY(t,e){function n(x,g){x.matrixAutoUpdate===!0&&x.updateMatrix(),g.value.copy(x.matrix)}function i(x,g){g.color.getRGB(x.fogColor.value,rL(t)),g.isFog?(x.fogNear.value=g.near,x.fogFar.value=g.far):g.isFogExp2&&(x.fogDensity.value=g.density)}function r(x,g,_,w,T){g.isMeshBasicMaterial||g.isMeshLambertMaterial?s(x,g):g.isMeshToonMaterial?(s(x,g),h(x,g)):g.isMeshPhongMaterial?(s(x,g),d(x,g)):g.isMeshStandardMaterial?(s(x,g),p(x,g),g.isMeshPhysicalMaterial&&m(x,g,T)):g.isMeshMatcapMaterial?(s(x,g),y(x,g)):g.isMeshDepthMaterial?s(x,g):g.isMeshDistanceMaterial?(s(x,g),S(x,g)):g.isMeshNormalMaterial?s(x,g):g.isLineBasicMaterial?(o(x,g),g.isLineDashedMaterial&&a(x,g)):g.isPointsMaterial?l(x,g,_,w):g.isSpriteMaterial?c(x,g):g.isShadowMaterial?(x.color.value.copy(g.color),x.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(x,g){x.opacity.value=g.opacity,g.color&&x.diffuse.value.copy(g.color),g.emissive&&x.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(x.map.value=g.map,n(g.map,x.mapTransform)),g.alphaMap&&(x.alphaMap.value=g.alphaMap,n(g.alphaMap,x.alphaMapTransform)),g.bumpMap&&(x.bumpMap.value=g.bumpMap,n(g.bumpMap,x.bumpMapTransform),x.bumpScale.value=g.bumpScale,g.side===sr&&(x.bumpScale.value*=-1)),g.normalMap&&(x.normalMap.value=g.normalMap,n(g.normalMap,x.normalMapTransform),x.normalScale.value.copy(g.normalScale),g.side===sr&&x.normalScale.value.negate()),g.displacementMap&&(x.displacementMap.value=g.displacementMap,n(g.displacementMap,x.displacementMapTransform),x.displacementScale.value=g.displacementScale,x.displacementBias.value=g.displacementBias),g.emissiveMap&&(x.emissiveMap.value=g.emissiveMap,n(g.emissiveMap,x.emissiveMapTransform)),g.specularMap&&(x.specularMap.value=g.specularMap,n(g.specularMap,x.specularMapTransform)),g.alphaTest>0&&(x.alphaTest.value=g.alphaTest);const _=e.get(g),w=_.envMap,T=_.envMapRotation;w&&(x.envMap.value=w,Ml.copy(T),Ml.x*=-1,Ml.y*=-1,Ml.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Ml.y*=-1,Ml.z*=-1),x.envMapRotation.value.setFromMatrix4(PY.makeRotationFromEuler(Ml)),x.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=g.reflectivity,x.ior.value=g.ior,x.refractionRatio.value=g.refractionRatio),g.lightMap&&(x.lightMap.value=g.lightMap,x.lightMapIntensity.value=g.lightMapIntensity,n(g.lightMap,x.lightMapTransform)),g.aoMap&&(x.aoMap.value=g.aoMap,x.aoMapIntensity.value=g.aoMapIntensity,n(g.aoMap,x.aoMapTransform))}function o(x,g){x.diffuse.value.copy(g.color),x.opacity.value=g.opacity,g.map&&(x.map.value=g.map,n(g.map,x.mapTransform))}function a(x,g){x.dashSize.value=g.dashSize,x.totalSize.value=g.dashSize+g.gapSize,x.scale.value=g.scale}function l(x,g,_,w){x.diffuse.value.copy(g.color),x.opacity.value=g.opacity,x.size.value=g.size*_,x.scale.value=w*.5,g.map&&(x.map.value=g.map,n(g.map,x.uvTransform)),g.alphaMap&&(x.alphaMap.value=g.alphaMap,n(g.alphaMap,x.alphaMapTransform)),g.alphaTest>0&&(x.alphaTest.value=g.alphaTest)}function c(x,g){x.diffuse.value.copy(g.color),x.opacity.value=g.opacity,x.rotation.value=g.rotation,g.map&&(x.map.value=g.map,n(g.map,x.mapTransform)),g.alphaMap&&(x.alphaMap.value=g.alphaMap,n(g.alphaMap,x.alphaMapTransform)),g.alphaTest>0&&(x.alphaTest.value=g.alphaTest)}function d(x,g){x.specular.value.copy(g.specular),x.shininess.value=Math.max(g.shininess,1e-4)}function h(x,g){g.gradientMap&&(x.gradientMap.value=g.gradientMap)}function p(x,g){x.metalness.value=g.metalness,g.metalnessMap&&(x.metalnessMap.value=g.metalnessMap,n(g.metalnessMap,x.metalnessMapTransform)),x.roughness.value=g.roughness,g.roughnessMap&&(x.roughnessMap.value=g.roughnessMap,n(g.roughnessMap,x.roughnessMapTransform)),g.envMap&&(x.envMapIntensity.value=g.envMapIntensity)}function m(x,g,_){x.ior.value=g.ior,g.sheen>0&&(x.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),x.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(x.sheenColorMap.value=g.sheenColorMap,n(g.sheenColorMap,x.sheenColorMapTransform)),g.sheenRoughnessMap&&(x.sheenRoughnessMap.value=g.sheenRoughnessMap,n(g.sheenRoughnessMap,x.sheenRoughnessMapTransform))),g.clearcoat>0&&(x.clearcoat.value=g.clearcoat,x.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(x.clearcoatMap.value=g.clearcoatMap,n(g.clearcoatMap,x.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,n(g.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(x.clearcoatNormalMap.value=g.clearcoatNormalMap,n(g.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===sr&&x.clearcoatNormalScale.value.negate())),g.dispersion>0&&(x.dispersion.value=g.dispersion),g.iridescence>0&&(x.iridescence.value=g.iridescence,x.iridescenceIOR.value=g.iridescenceIOR,x.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(x.iridescenceMap.value=g.iridescenceMap,n(g.iridescenceMap,x.iridescenceMapTransform)),g.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=g.iridescenceThicknessMap,n(g.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),g.transmission>0&&(x.transmission.value=g.transmission,x.transmissionSamplerMap.value=_.texture,x.transmissionSamplerSize.value.set(_.width,_.height),g.transmissionMap&&(x.transmissionMap.value=g.transmissionMap,n(g.transmissionMap,x.transmissionMapTransform)),x.thickness.value=g.thickness,g.thicknessMap&&(x.thicknessMap.value=g.thicknessMap,n(g.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=g.attenuationDistance,x.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(x.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(x.anisotropyMap.value=g.anisotropyMap,n(g.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=g.specularIntensity,x.specularColor.value.copy(g.specularColor),g.specularColorMap&&(x.specularColorMap.value=g.specularColorMap,n(g.specularColorMap,x.specularColorMapTransform)),g.specularIntensityMap&&(x.specularIntensityMap.value=g.specularIntensityMap,n(g.specularIntensityMap,x.specularIntensityMapTransform))}function y(x,g){g.matcap&&(x.matcap.value=g.matcap)}function S(x,g){const _=e.get(g).light;x.referencePosition.value.setFromMatrixPosition(_.matrixWorld),x.nearDistance.value=_.shadow.camera.near,x.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function IY(t,e,n,i){let r={},s={},o=[];const a=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,w){const T=w.program;i.uniformBlockBinding(_,T)}function c(_,w){let T=r[_.id];T===void 0&&(y(_),T=d(_),r[_.id]=T,_.addEventListener("dispose",x));const N=w.program;i.updateUBOMapping(_,N);const L=e.render.frame;s[_.id]!==L&&(p(_),s[_.id]=L)}function d(_){const w=h();_.__bindingPointIndex=w;const T=t.createBuffer(),N=_.__size,L=_.usage;return t.bindBuffer(t.UNIFORM_BUFFER,T),t.bufferData(t.UNIFORM_BUFFER,N,L),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,w,T),T}function h(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(_){const w=r[_.id],T=_.uniforms,N=_.__cache;t.bindBuffer(t.UNIFORM_BUFFER,w);for(let L=0,B=T.length;L<B;L++){const O=Array.isArray(T[L])?T[L]:[T[L]];for(let Q=0,I=O.length;Q<I;Q++){const F=O[Q];if(m(F,L,Q,N)===!0){const ge=F.__offset,J=Array.isArray(F.value)?F.value:[F.value];let W=0;for(let ve=0;ve<J.length;ve++){const le=J[ve],ke=S(le);typeof le=="number"||typeof le=="boolean"?(F.__data[0]=le,t.bufferSubData(t.UNIFORM_BUFFER,ge+W,F.__data)):le.isMatrix3?(F.__data[0]=le.elements[0],F.__data[1]=le.elements[1],F.__data[2]=le.elements[2],F.__data[3]=0,F.__data[4]=le.elements[3],F.__data[5]=le.elements[4],F.__data[6]=le.elements[5],F.__data[7]=0,F.__data[8]=le.elements[6],F.__data[9]=le.elements[7],F.__data[10]=le.elements[8],F.__data[11]=0):(le.toArray(F.__data,W),W+=ke.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,ge,F.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function m(_,w,T,N){const L=_.value,B=w+"_"+T;if(N[B]===void 0)return typeof L=="number"||typeof L=="boolean"?N[B]=L:N[B]=L.clone(),!0;{const O=N[B];if(typeof L=="number"||typeof L=="boolean"){if(O!==L)return N[B]=L,!0}else if(O.equals(L)===!1)return O.copy(L),!0}return!1}function y(_){const w=_.uniforms;let T=0;const N=16;for(let B=0,O=w.length;B<O;B++){const Q=Array.isArray(w[B])?w[B]:[w[B]];for(let I=0,F=Q.length;I<F;I++){const ge=Q[I],J=Array.isArray(ge.value)?ge.value:[ge.value];for(let W=0,ve=J.length;W<ve;W++){const le=J[W],ke=S(le),ee=T%N,$=ee%ke.boundary,_e=ee+$;T+=$,_e!==0&&N-_e<ke.storage&&(T+=N-_e),ge.__data=new Float32Array(ke.storage/Float32Array.BYTES_PER_ELEMENT),ge.__offset=T,T+=ke.storage}}}const L=T%N;return L>0&&(T+=N-L),_.__size=T,_.__cache={},this}function S(_){const w={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(w.boundary=4,w.storage=4):_.isVector2?(w.boundary=8,w.storage=8):_.isVector3||_.isColor?(w.boundary=16,w.storage=12):_.isVector4?(w.boundary=16,w.storage=16):_.isMatrix3?(w.boundary=48,w.storage=48):_.isMatrix4?(w.boundary=64,w.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),w}function x(_){const w=_.target;w.removeEventListener("dispose",x);const T=o.indexOf(w.__bindingPointIndex);o.splice(T,1),t.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function g(){for(const _ in r)t.deleteBuffer(r[_]);o=[],r={},s={}}return{bind:l,update:c,dispose:g}}class T2{constructor(e={}){const{canvas:n=eL(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;const m=new Uint32Array(4),y=new Int32Array(4);let S=null,x=null;const g=[],_=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=gr,this.toneMapping=io,this.toneMappingExposure=1;const w=this;let T=!1,N=0,L=0,B=null,O=-1,Q=null;const I=new cn,F=new cn;let ge=null;const J=new Pt(0);let W=0,ve=n.width,le=n.height,ke=1,ee=null,$=null;const _e=new cn(0,0,ve,le),Ce=new cn(0,0,ve,le);let Ye=!1;const ct=new jp;let De=!1,je=!1;const qe=new Wt,it=new Wt,bt=new ce,Tt=new cn,Nt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Dt=!1;function st(){return B===null?ke:1}let se=i;function ht(D,j){return n.getContext(D,j)}try{const D={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Bp}`),n.addEventListener("webglcontextlost",Ge,!1),n.addEventListener("webglcontextrestored",lt,!1),n.addEventListener("webglcontextcreationerror",ft,!1),se===null){const j="webgl2";if(se=ht(j,D),se===null)throw ht(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(D){throw console.error("THREE.WebGLRenderer: "+D.message),D}let mt,ut,gt,Rt,vt,re,G,Le,et,ot,te,q,C,b,E,R,X,ne,he,be,nt,ze,Xe,ue;function Fe(){mt=new DX(se),mt.init(),ze=new dL(se,mt),ut=new IX(se,mt,e,ze),gt=new yY(se),ut.reverseDepthBuffer&&gt.buffers.depth.setReversed(!0),Rt=new FX(se),vt=new rY,re=new bY(se,mt,gt,vt,ut,ze,Rt),G=new LX(w),Le=new NX(w),et=new qj(se),Xe=new PX(se,et),ot=new OX(se,et,Rt,Xe),te=new HX(se,ot,et,Rt),he=new VX(se,ut,re),R=new kX(vt),q=new iY(w,G,Le,mt,ut,Xe,R),C=new RY(w,vt),b=new oY,E=new dY(mt),ne=new CX(w,G,Le,gt,te,p,l),X=new mY(w,te,ut),ue=new IY(se,Rt,ut,gt),be=new RX(se,mt,Rt),nt=new zX(se,mt,Rt),Rt.programs=q.programs,w.capabilities=ut,w.extensions=mt,w.properties=vt,w.renderLists=b,w.shadowMap=X,w.state=gt,w.info=Rt}Fe();const ye=new CY(w,se);this.xr=ye,this.getContext=function(){return se},this.getContextAttributes=function(){return se.getContextAttributes()},this.forceContextLoss=function(){const D=mt.get("WEBGL_lose_context");D&&D.loseContext()},this.forceContextRestore=function(){const D=mt.get("WEBGL_lose_context");D&&D.restoreContext()},this.getPixelRatio=function(){return ke},this.setPixelRatio=function(D){D!==void 0&&(ke=D,this.setSize(ve,le,!1))},this.getSize=function(D){return D.set(ve,le)},this.setSize=function(D,j,ae=!0){if(ye.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}ve=D,le=j,n.width=Math.floor(D*ke),n.height=Math.floor(j*ke),ae===!0&&(n.style.width=D+"px",n.style.height=j+"px"),this.setViewport(0,0,D,j)},this.getDrawingBufferSize=function(D){return D.set(ve*ke,le*ke).floor()},this.setDrawingBufferSize=function(D,j,ae){ve=D,le=j,ke=ae,n.width=Math.floor(D*ae),n.height=Math.floor(j*ae),this.setViewport(0,0,D,j)},this.getCurrentViewport=function(D){return D.copy(I)},this.getViewport=function(D){return D.copy(_e)},this.setViewport=function(D,j,ae,oe){D.isVector4?_e.set(D.x,D.y,D.z,D.w):_e.set(D,j,ae,oe),gt.viewport(I.copy(_e).multiplyScalar(ke).round())},this.getScissor=function(D){return D.copy(Ce)},this.setScissor=function(D,j,ae,oe){D.isVector4?Ce.set(D.x,D.y,D.z,D.w):Ce.set(D,j,ae,oe),gt.scissor(F.copy(Ce).multiplyScalar(ke).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(D){gt.setScissorTest(Ye=D)},this.setOpaqueSort=function(D){ee=D},this.setTransparentSort=function(D){$=D},this.getClearColor=function(D){return D.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor.apply(ne,arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha.apply(ne,arguments)},this.clear=function(D=!0,j=!0,ae=!0){let oe=0;if(D){let ie=!1;if(B!==null){const Se=B.texture.format;ie=Se===Uv||Se===Lv||Se===zp}if(ie){const Se=B.texture.type,Ee=Se===Mr||Se===ao||Se===Tf||Se===pc||Se===Iv||Se===kv,Te=ne.getClearColor(),Ke=ne.getClearAlpha(),Be=Te.r,Ve=Te.g,Ne=Te.b;Ee?(m[0]=Be,m[1]=Ve,m[2]=Ne,m[3]=Ke,se.clearBufferuiv(se.COLOR,0,m)):(y[0]=Be,y[1]=Ve,y[2]=Ne,y[3]=Ke,se.clearBufferiv(se.COLOR,0,y))}else oe|=se.COLOR_BUFFER_BIT}j&&(oe|=se.DEPTH_BUFFER_BIT,se.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),ae&&(oe|=se.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),se.clear(oe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",Ge,!1),n.removeEventListener("webglcontextrestored",lt,!1),n.removeEventListener("webglcontextcreationerror",ft,!1),b.dispose(),E.dispose(),vt.dispose(),G.dispose(),Le.dispose(),te.dispose(),Xe.dispose(),ue.dispose(),q.dispose(),ye.dispose(),ye.removeEventListener("sessionstart",Cr),ye.removeEventListener("sessionend",qn),fr.stop()};function Ge(D){D.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function lt(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const D=Rt.autoReset,j=X.enabled,ae=X.autoUpdate,oe=X.needsUpdate,ie=X.type;Fe(),Rt.autoReset=D,X.enabled=j,X.autoUpdate=ae,X.needsUpdate=oe,X.type=ie}function ft(D){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",D.statusMessage)}function Ot(D){const j=D.target;j.removeEventListener("dispose",Ot),Xt(j)}function Xt(D){sn(D),vt.remove(D)}function sn(D){const j=vt.get(D).programs;j!==void 0&&(j.forEach(function(ae){q.releaseProgram(ae)}),D.isShaderMaterial&&q.releaseShaderCache(D))}this.renderBufferDirect=function(D,j,ae,oe,ie,Se){j===null&&(j=Nt);const Ee=ie.isMesh&&ie.matrixWorld.determinant()<0,Te=H(D,j,ae,oe,ie);gt.setMaterial(oe,Ee);let Ke=ae.index,Be=1;if(oe.wireframe===!0){if(Ke=ot.getWireframeAttribute(ae),Ke===void 0)return;Be=2}const Ve=ae.drawRange,Ne=ae.attributes.position;let $e=Ve.start*Be,rt=(Ve.start+Ve.count)*Be;Se!==null&&($e=Math.max($e,Se.start*Be),rt=Math.min(rt,(Se.start+Se.count)*Be)),Ke!==null?($e=Math.max($e,0),rt=Math.min(rt,Ke.count)):Ne!=null&&($e=Math.max($e,0),rt=Math.min(rt,Ne.count));const Qe=rt-$e;if(Qe<0||Qe===1/0)return;Xe.setup(ie,oe,Te,ae,Ke);let Me,we=be;if(Ke!==null&&(Me=et.get(Ke),we=nt,we.setIndex(Me)),ie.isMesh)oe.wireframe===!0?(gt.setLineWidth(oe.wireframeLinewidth*st()),we.setMode(se.LINES)):we.setMode(se.TRIANGLES);else if(ie.isLine){let Ae=oe.linewidth;Ae===void 0&&(Ae=1),gt.setLineWidth(Ae*st()),ie.isLineSegments?we.setMode(se.LINES):ie.isLineLoop?we.setMode(se.LINE_LOOP):we.setMode(se.LINE_STRIP)}else ie.isPoints?we.setMode(se.POINTS):ie.isSprite&&we.setMode(se.TRIANGLES);if(ie.isBatchedMesh)if(ie._multiDrawInstances!==null)we.renderMultiDrawInstances(ie._multiDrawStarts,ie._multiDrawCounts,ie._multiDrawCount,ie._multiDrawInstances);else if(mt.get("WEBGL_multi_draw"))we.renderMultiDraw(ie._multiDrawStarts,ie._multiDrawCounts,ie._multiDrawCount);else{const Ae=ie._multiDrawStarts,He=ie._multiDrawCounts,Re=ie._multiDrawCount,Je=Ke?et.get(Ke).bytesPerElement:1,wt=vt.get(oe).currentProgram.getUniforms();for(let _t=0;_t<Re;_t++)wt.setValue(se,"_gl_DrawID",_t),we.render(Ae[_t]/Je,He[_t])}else if(ie.isInstancedMesh)we.renderInstances($e,Qe,ie.count);else if(ae.isInstancedBufferGeometry){const Ae=ae._maxInstanceCount!==void 0?ae._maxInstanceCount:1/0,He=Math.min(ae.instanceCount,Ae);we.renderInstances($e,Qe,He)}else we.render($e,Qe)};function Yt(D,j,ae){D.transparent===!0&&D.side===ls&&D.forceSinglePass===!1?(D.side=sr,D.needsUpdate=!0,Ie(D,j,ae),D.side=Yo,D.needsUpdate=!0,Ie(D,j,ae),D.side=ls):Ie(D,j,ae)}this.compile=function(D,j,ae=null){ae===null&&(ae=D),x=E.get(ae),x.init(j),_.push(x),ae.traverseVisible(function(ie){ie.isLight&&ie.layers.test(j.layers)&&(x.pushLight(ie),ie.castShadow&&x.pushShadow(ie))}),D!==ae&&D.traverseVisible(function(ie){ie.isLight&&ie.layers.test(j.layers)&&(x.pushLight(ie),ie.castShadow&&x.pushShadow(ie))}),x.setupLights();const oe=new Set;return D.traverse(function(ie){if(!(ie.isMesh||ie.isPoints||ie.isLine||ie.isSprite))return;const Se=ie.material;if(Se)if(Array.isArray(Se))for(let Ee=0;Ee<Se.length;Ee++){const Te=Se[Ee];Yt(Te,ae,ie),oe.add(Te)}else Yt(Se,ae,ie),oe.add(Se)}),_.pop(),x=null,oe},this.compileAsync=function(D,j,ae=null){const oe=this.compile(D,j,ae);return new Promise(ie=>{function Se(){if(oe.forEach(function(Ee){vt.get(Ee).currentProgram.isReady()&&oe.delete(Ee)}),oe.size===0){ie(D);return}setTimeout(Se,10)}mt.get("KHR_parallel_shader_compile")!==null?Se():setTimeout(Se,10)})};let xn=null;function Dn(D){xn&&xn(D)}function Cr(){fr.stop()}function qn(){fr.start()}const fr=new aL;fr.setAnimationLoop(Dn),typeof self<"u"&&fr.setContext(self),this.setAnimationLoop=function(D){xn=D,ye.setAnimationLoop(D),D===null?fr.stop():fr.start()},ye.addEventListener("sessionstart",Cr),ye.addEventListener("sessionend",qn),this.render=function(D,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),ye.enabled===!0&&ye.isPresenting===!0&&(ye.cameraAutoUpdate===!0&&ye.updateCamera(j),j=ye.getCamera()),D.isScene===!0&&D.onBeforeRender(w,D,j,B),x=E.get(D,_.length),x.init(j),_.push(x),it.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),ct.setFromProjectionMatrix(it),je=this.localClippingEnabled,De=R.init(this.clippingPlanes,je),S=b.get(D,g.length),S.init(),g.push(S),ye.enabled===!0&&ye.isPresenting===!0){const Se=w.xr.getDepthSensingMesh();Se!==null&&V(Se,j,-1/0,w.sortObjects)}V(D,j,0,w.sortObjects),S.finish(),w.sortObjects===!0&&S.sort(ee,$),Dt=ye.enabled===!1||ye.isPresenting===!1||ye.hasDepthSensing()===!1,Dt&&ne.addToRenderList(S,D),this.info.render.frame++,De===!0&&R.beginShadows();const ae=x.state.shadowsArray;X.render(ae,D,j),De===!0&&R.endShadows(),this.info.autoReset===!0&&this.info.reset();const oe=S.opaque,ie=S.transmissive;if(x.setupLights(),j.isArrayCamera){const Se=j.cameras;if(ie.length>0)for(let Ee=0,Te=Se.length;Ee<Te;Ee++){const Ke=Se[Ee];Y(oe,ie,D,Ke)}Dt&&ne.render(D);for(let Ee=0,Te=Se.length;Ee<Te;Ee++){const Ke=Se[Ee];K(S,D,Ke,Ke.viewport)}}else ie.length>0&&Y(oe,ie,D,j),Dt&&ne.render(D),K(S,D,j);B!==null&&(re.updateMultisampleRenderTarget(B),re.updateRenderTargetMipmap(B)),D.isScene===!0&&D.onAfterRender(w,D,j),Xe.resetDefaultState(),O=-1,Q=null,_.pop(),_.length>0?(x=_[_.length-1],De===!0&&R.setGlobalState(w.clippingPlanes,x.state.camera)):x=null,g.pop(),g.length>0?S=g[g.length-1]:S=null};function V(D,j,ae,oe){if(D.visible===!1)return;if(D.layers.test(j.layers)){if(D.isGroup)ae=D.renderOrder;else if(D.isLOD)D.autoUpdate===!0&&D.update(j);else if(D.isLight)x.pushLight(D),D.castShadow&&x.pushShadow(D);else if(D.isSprite){if(!D.frustumCulled||ct.intersectsSprite(D)){oe&&Tt.setFromMatrixPosition(D.matrixWorld).applyMatrix4(it);const Ee=te.update(D),Te=D.material;Te.visible&&S.push(D,Ee,Te,ae,Tt.z,null)}}else if((D.isMesh||D.isLine||D.isPoints)&&(!D.frustumCulled||ct.intersectsObject(D))){const Ee=te.update(D),Te=D.material;if(oe&&(D.boundingSphere!==void 0?(D.boundingSphere===null&&D.computeBoundingSphere(),Tt.copy(D.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Tt.copy(Ee.boundingSphere.center)),Tt.applyMatrix4(D.matrixWorld).applyMatrix4(it)),Array.isArray(Te)){const Ke=Ee.groups;for(let Be=0,Ve=Ke.length;Be<Ve;Be++){const Ne=Ke[Be],$e=Te[Ne.materialIndex];$e&&$e.visible&&S.push(D,Ee,$e,ae,Tt.z,Ne)}}else Te.visible&&S.push(D,Ee,Te,ae,Tt.z,null)}}const Se=D.children;for(let Ee=0,Te=Se.length;Ee<Te;Ee++)V(Se[Ee],j,ae,oe)}function K(D,j,ae,oe){const ie=D.opaque,Se=D.transmissive,Ee=D.transparent;x.setupLightsView(ae),De===!0&&R.setGlobalState(w.clippingPlanes,ae),oe&&gt.viewport(I.copy(oe)),ie.length>0&&A(ie,j,ae),Se.length>0&&A(Se,j,ae),Ee.length>0&&A(Ee,j,ae),gt.buffers.depth.setTest(!0),gt.buffers.depth.setMask(!0),gt.buffers.color.setMask(!0),gt.setPolygonOffset(!1)}function Y(D,j,ae,oe){if((ae.isScene===!0?ae.overrideMaterial:null)!==null)return;x.state.transmissionRenderTarget[oe.id]===void 0&&(x.state.transmissionRenderTarget[oe.id]=new jr(1,1,{generateMipmaps:!0,type:mt.has("EXT_color_buffer_half_float")||mt.has("EXT_color_buffer_float")?Ti:Mr,minFilter:Ys,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:mn.workingColorSpace}));const Se=x.state.transmissionRenderTarget[oe.id],Ee=oe.viewport||I;Se.setSize(Ee.z,Ee.w);const Te=w.getRenderTarget();w.setRenderTarget(Se),w.getClearColor(J),W=w.getClearAlpha(),W<1&&w.setClearColor(16777215,.5),w.clear(),Dt&&ne.render(ae);const Ke=w.toneMapping;w.toneMapping=io;const Be=oe.viewport;if(oe.viewport!==void 0&&(oe.viewport=void 0),x.setupLightsView(oe),De===!0&&R.setGlobalState(w.clippingPlanes,oe),A(D,ae,oe),re.updateMultisampleRenderTarget(Se),re.updateRenderTargetMipmap(Se),mt.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let Ne=0,$e=j.length;Ne<$e;Ne++){const rt=j[Ne],Qe=rt.object,Me=rt.geometry,we=rt.material,Ae=rt.group;if(we.side===ls&&Qe.layers.test(oe.layers)){const He=we.side;we.side=sr,we.needsUpdate=!0,Z(Qe,ae,oe,Me,we,Ae),we.side=He,we.needsUpdate=!0,Ve=!0}}Ve===!0&&(re.updateMultisampleRenderTarget(Se),re.updateRenderTargetMipmap(Se))}w.setRenderTarget(Te),w.setClearColor(J,W),Be!==void 0&&(oe.viewport=Be),w.toneMapping=Ke}function A(D,j,ae){const oe=j.isScene===!0?j.overrideMaterial:null;for(let ie=0,Se=D.length;ie<Se;ie++){const Ee=D[ie],Te=Ee.object,Ke=Ee.geometry,Be=oe===null?Ee.material:oe,Ve=Ee.group;Te.layers.test(ae.layers)&&Z(Te,j,ae,Ke,Be,Ve)}}function Z(D,j,ae,oe,ie,Se){D.onBeforeRender(w,j,ae,oe,ie,Se),D.modelViewMatrix.multiplyMatrices(ae.matrixWorldInverse,D.matrixWorld),D.normalMatrix.getNormalMatrix(D.modelViewMatrix),ie.onBeforeRender(w,j,ae,oe,D,Se),ie.transparent===!0&&ie.side===ls&&ie.forceSinglePass===!1?(ie.side=sr,ie.needsUpdate=!0,w.renderBufferDirect(ae,j,oe,ie,D,Se),ie.side=Yo,ie.needsUpdate=!0,w.renderBufferDirect(ae,j,oe,ie,D,Se),ie.side=ls):w.renderBufferDirect(ae,j,oe,ie,D,Se),D.onAfterRender(w,j,ae,oe,ie,Se)}function Ie(D,j,ae){j.isScene!==!0&&(j=Nt);const oe=vt.get(D),ie=x.state.lights,Se=x.state.shadowsArray,Ee=ie.state.version,Te=q.getParameters(D,ie.state,Se,j,ae),Ke=q.getProgramCacheKey(Te);let Be=oe.programs;oe.environment=D.isMeshStandardMaterial?j.environment:null,oe.fog=j.fog,oe.envMap=(D.isMeshStandardMaterial?Le:G).get(D.envMap||oe.environment),oe.envMapRotation=oe.environment!==null&&D.envMap===null?j.environmentRotation:D.envMapRotation,Be===void 0&&(D.addEventListener("dispose",Ot),Be=new Map,oe.programs=Be);let Ve=Be.get(Ke);if(Ve!==void 0){if(oe.currentProgram===Ve&&oe.lightsStateVersion===Ee)return U(D,Te),Ve}else Te.uniforms=q.getUniforms(D),D.onBeforeCompile(Te,w),Ve=q.acquireProgram(Te,Ke),Be.set(Ke,Ve),oe.uniforms=Te.uniforms;const Ne=oe.uniforms;return(!D.isShaderMaterial&&!D.isRawShaderMaterial||D.clipping===!0)&&(Ne.clippingPlanes=R.uniform),U(D,Te),oe.needsLights=xe(D),oe.lightsStateVersion=Ee,oe.needsLights&&(Ne.ambientLightColor.value=ie.state.ambient,Ne.lightProbe.value=ie.state.probe,Ne.directionalLights.value=ie.state.directional,Ne.directionalLightShadows.value=ie.state.directionalShadow,Ne.spotLights.value=ie.state.spot,Ne.spotLightShadows.value=ie.state.spotShadow,Ne.rectAreaLights.value=ie.state.rectArea,Ne.ltc_1.value=ie.state.rectAreaLTC1,Ne.ltc_2.value=ie.state.rectAreaLTC2,Ne.pointLights.value=ie.state.point,Ne.pointLightShadows.value=ie.state.pointShadow,Ne.hemisphereLights.value=ie.state.hemi,Ne.directionalShadowMap.value=ie.state.directionalShadowMap,Ne.directionalShadowMatrix.value=ie.state.directionalShadowMatrix,Ne.spotShadowMap.value=ie.state.spotShadowMap,Ne.spotLightMatrix.value=ie.state.spotLightMatrix,Ne.spotLightMap.value=ie.state.spotLightMap,Ne.pointShadowMap.value=ie.state.pointShadowMap,Ne.pointShadowMatrix.value=ie.state.pointShadowMatrix),oe.currentProgram=Ve,oe.uniformsList=null,Ve}function Oe(D){if(D.uniformsList===null){const j=D.currentProgram.getUniforms();D.uniformsList=P0.seqWithValue(j.seq,D.uniforms)}return D.uniformsList}function U(D,j){const ae=vt.get(D);ae.outputColorSpace=j.outputColorSpace,ae.batching=j.batching,ae.batchingColor=j.batchingColor,ae.instancing=j.instancing,ae.instancingColor=j.instancingColor,ae.instancingMorph=j.instancingMorph,ae.skinning=j.skinning,ae.morphTargets=j.morphTargets,ae.morphNormals=j.morphNormals,ae.morphColors=j.morphColors,ae.morphTargetsCount=j.morphTargetsCount,ae.numClippingPlanes=j.numClippingPlanes,ae.numIntersection=j.numClipIntersection,ae.vertexAlphas=j.vertexAlphas,ae.vertexTangents=j.vertexTangents,ae.toneMapping=j.toneMapping}function H(D,j,ae,oe,ie){j.isScene!==!0&&(j=Nt),re.resetTextureUnits();const Se=j.fog,Ee=oe.isMeshStandardMaterial?j.environment:null,Te=B===null?w.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:ps,Ke=(oe.isMeshStandardMaterial?Le:G).get(oe.envMap||Ee),Be=oe.vertexColors===!0&&!!ae.attributes.color&&ae.attributes.color.itemSize===4,Ve=!!ae.attributes.tangent&&(!!oe.normalMap||oe.anisotropy>0),Ne=!!ae.morphAttributes.position,$e=!!ae.morphAttributes.normal,rt=!!ae.morphAttributes.color;let Qe=io;oe.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(Qe=w.toneMapping);const Me=ae.morphAttributes.position||ae.morphAttributes.normal||ae.morphAttributes.color,we=Me!==void 0?Me.length:0,Ae=vt.get(oe),He=x.state.lights;if(De===!0&&(je===!0||D!==Q)){const xt=D===Q&&oe.id===O;R.setState(oe,D,xt)}let Re=!1;oe.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==He.state.version||Ae.outputColorSpace!==Te||ie.isBatchedMesh&&Ae.batching===!1||!ie.isBatchedMesh&&Ae.batching===!0||ie.isBatchedMesh&&Ae.batchingColor===!0&&ie.colorTexture===null||ie.isBatchedMesh&&Ae.batchingColor===!1&&ie.colorTexture!==null||ie.isInstancedMesh&&Ae.instancing===!1||!ie.isInstancedMesh&&Ae.instancing===!0||ie.isSkinnedMesh&&Ae.skinning===!1||!ie.isSkinnedMesh&&Ae.skinning===!0||ie.isInstancedMesh&&Ae.instancingColor===!0&&ie.instanceColor===null||ie.isInstancedMesh&&Ae.instancingColor===!1&&ie.instanceColor!==null||ie.isInstancedMesh&&Ae.instancingMorph===!0&&ie.morphTexture===null||ie.isInstancedMesh&&Ae.instancingMorph===!1&&ie.morphTexture!==null||Ae.envMap!==Ke||oe.fog===!0&&Ae.fog!==Se||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==R.numPlanes||Ae.numIntersection!==R.numIntersection)||Ae.vertexAlphas!==Be||Ae.vertexTangents!==Ve||Ae.morphTargets!==Ne||Ae.morphNormals!==$e||Ae.morphColors!==rt||Ae.toneMapping!==Qe||Ae.morphTargetsCount!==we)&&(Re=!0):(Re=!0,Ae.__version=oe.version);let Je=Ae.currentProgram;Re===!0&&(Je=Ie(oe,j,ie));let wt=!1,_t=!1,Lt=!1;const dt=Je.getUniforms(),pe=Ae.uniforms;if(gt.useProgram(Je.program)&&(wt=!0,_t=!0,Lt=!0),oe.id!==O&&(O=oe.id,_t=!0),wt||Q!==D){ut.reverseDepthBuffer?(qe.copy(D.projectionMatrix),vj(qe),xj(qe),dt.setValue(se,"projectionMatrix",qe)):dt.setValue(se,"projectionMatrix",D.projectionMatrix),dt.setValue(se,"viewMatrix",D.matrixWorldInverse);const xt=dt.map.cameraPosition;xt!==void 0&&xt.setValue(se,bt.setFromMatrixPosition(D.matrixWorld)),ut.logarithmicDepthBuffer&&dt.setValue(se,"logDepthBufFC",2/(Math.log(D.far+1)/Math.LN2)),(oe.isMeshPhongMaterial||oe.isMeshToonMaterial||oe.isMeshLambertMaterial||oe.isMeshBasicMaterial||oe.isMeshStandardMaterial||oe.isShaderMaterial)&&dt.setValue(se,"isOrthographic",D.isOrthographicCamera===!0),Q!==D&&(Q=D,_t=!0,Lt=!0)}if(ie.isSkinnedMesh){dt.setOptional(se,ie,"bindMatrix"),dt.setOptional(se,ie,"bindMatrixInverse");const xt=ie.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),dt.setValue(se,"boneTexture",xt.boneTexture,re))}ie.isBatchedMesh&&(dt.setOptional(se,ie,"batchingTexture"),dt.setValue(se,"batchingTexture",ie._matricesTexture,re),dt.setOptional(se,ie,"batchingIdTexture"),dt.setValue(se,"batchingIdTexture",ie._indirectTexture,re),dt.setOptional(se,ie,"batchingColorTexture"),ie._colorsTexture!==null&&dt.setValue(se,"batchingColorTexture",ie._colorsTexture,re));const At=ae.morphAttributes;if((At.position!==void 0||At.normal!==void 0||At.color!==void 0)&&he.update(ie,ae,Je),(_t||Ae.receiveShadow!==ie.receiveShadow)&&(Ae.receiveShadow=ie.receiveShadow,dt.setValue(se,"receiveShadow",ie.receiveShadow)),oe.isMeshGouraudMaterial&&oe.envMap!==null&&(pe.envMap.value=Ke,pe.flipEnvMap.value=Ke.isCubeTexture&&Ke.isRenderTargetTexture===!1?-1:1),oe.isMeshStandardMaterial&&oe.envMap===null&&j.environment!==null&&(pe.envMapIntensity.value=j.environmentIntensity),_t&&(dt.setValue(se,"toneMappingExposure",w.toneMappingExposure),Ae.needsLights&&fe(pe,Lt),Se&&oe.fog===!0&&C.refreshFogUniforms(pe,Se),C.refreshMaterialUniforms(pe,oe,ke,le,x.state.transmissionRenderTarget[D.id]),P0.upload(se,Oe(Ae),pe,re)),oe.isShaderMaterial&&oe.uniformsNeedUpdate===!0&&(P0.upload(se,Oe(Ae),pe,re),oe.uniformsNeedUpdate=!1),oe.isSpriteMaterial&&dt.setValue(se,"center",ie.center),dt.setValue(se,"modelViewMatrix",ie.modelViewMatrix),dt.setValue(se,"normalMatrix",ie.normalMatrix),dt.setValue(se,"modelMatrix",ie.matrixWorld),oe.isShaderMaterial||oe.isRawShaderMaterial){const xt=oe.uniformsGroups;for(let Ut=0,Ht=xt.length;Ut<Ht;Ut++){const Vt=xt[Ut];ue.update(Vt,Je),ue.bind(Vt,Je)}}return Je}function fe(D,j){D.ambientLightColor.needsUpdate=j,D.lightProbe.needsUpdate=j,D.directionalLights.needsUpdate=j,D.directionalLightShadows.needsUpdate=j,D.pointLights.needsUpdate=j,D.pointLightShadows.needsUpdate=j,D.spotLights.needsUpdate=j,D.spotLightShadows.needsUpdate=j,D.rectAreaLights.needsUpdate=j,D.hemisphereLights.needsUpdate=j}function xe(D){return D.isMeshLambertMaterial||D.isMeshToonMaterial||D.isMeshPhongMaterial||D.isMeshStandardMaterial||D.isShadowMaterial||D.isShaderMaterial&&D.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return B},this