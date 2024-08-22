struct VertexOut {
    @builtin(position)position: vec4f,
    @location(0) textureCoord: vec2f
};

struct Uniforms {
    rotationMatrix: mat4x4<f32>,
    fudgeFactor: f32,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex
fn vertmain(@location(0) pos: vec4f, @location(1) textCoord: vec2f) -> VertexOut {
    var out: VertexOut;
    let position = uni.rotationMatrix * pos;
    let zToDivideBy = 1.0 + position.z * uni.fudgeFactor;

    out.position = vec4f(position.xy / zToDivideBy, position.zw);
    out.textureCoord = textCoord;

    return out;
}


@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;
@fragment
fn fragMain(in: VertexOut) -> @location(0) vec4f {
    return textureSample(Texture, Sampler, in.textureCoord);
}
