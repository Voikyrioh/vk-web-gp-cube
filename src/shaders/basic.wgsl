struct VertexOut {
    @builtin(position)position: vec4f,
    @location(0) poscolor: vec4f
}

@vertex
fn vertmain(@location(0) pos: vec3f, @location(1) color: vec3f) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(pos.x, pos.y, 1, 1);
    out.poscolor = vec4f(color , 1);

    return out;
}

@fragment
fn fragMain(in: VertexOut) -> @location(0) vec4f {
    return in.poscolor;
}
