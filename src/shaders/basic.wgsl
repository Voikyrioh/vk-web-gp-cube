struct VertexOut {
    @builtin(position)position: vec4f,
    @location(0) textureCoord: vec2f
}

@vertex
fn vertmain(@location(0) pos: vec3f, @location(1) textCoord: vec2f) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(pos.x, pos.y, pos.z, 1);
    out.textureCoord = textCoord;

    return out;
}


@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@fragment
fn fragMain(in: VertexOut) -> @location(0) vec4f {
    return textureSample(Texture, Sampler, in.textureCoord);
}
