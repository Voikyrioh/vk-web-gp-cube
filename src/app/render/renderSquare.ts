export function buildSquareVertexXYPositions(
    canvasSize: { width: number; height: number },
    width: number,
    height: number,
    x= 0,
    y= 0
) {
    const clX = x < 0 ? 0 : (x > canvasSize.width ? canvasSize.width : x);
    const clY = y < 0 ? 0 : (y > canvasSize.height ? canvasSize.height : y);

    return [
        -1,  1,
        1,  1,
        1, -1,
        1, -1,
        -1, -1,
        -1,  1,
    ].map((pos, i) => i%2 ?
        ((height/canvasSize.height) * pos) + (1 - (height/canvasSize.height)) :
        (width/canvasSize.width) * pos - (1 - width/canvasSize.width)
    ).map((pos, i) => i%2 ?
        pos - ((clY/canvasSize.height)*2):
        pos + ((clX/canvasSize.width)*2)
    );
}
