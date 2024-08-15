import {Cube} from "./Cube.ts";
import Vector3 from "./Vector3.ts";
import {Slider} from "../../../web/components";

//type controllableProperties = "posX" | "posY" | "posZ" | "distance" | "rotateX" | "rotateY" | "rotateZ" ;
interface controllerAssign {
    posX?: Slider;
    posY?: Slider;
    posZ?: Slider;
    distance?: Slider;
    rotateX?: Slider;
    rotateY?: Slider;
    rotateZ?: Slider
}

export class GameMap {
    public cube: Cube;
    private pos: Vector3 = Vector3.fromArray([0,0,400])
    private rotations: Vector3 = Vector3.fromArray([45,45,0])
    private distance: number = 200;

    constructor() {
        this.cube = new Cube({
            angle: new Vector3(
                this.rotations.x/360*2*Math.PI,
                this.rotations.y/360*2*Math.PI,
                this.rotations.z/360*2*Math.PI
            ),
            coordinates: this.pos,
            distance: 1,
            size: this.distance,
            texturePath: "textures/grassblockAllSides.jpg"
        });
    }

    public draw() {
        this.cube.coordinates = this.pos;
        this.cube.size = this.distance;
        this.cube.angle = this.rotations;
    }

    public attachControls(controllers: controllerAssign) {
        controllers.posX?.attach((value) => { console.log(value); this.pos.x = value})
        controllers.posY?.attach((value) => {this.pos.y = value})
        controllers.posZ?.attach((value) => {this.pos.z = value})
        controllers.rotateX?.attach((value) => {this.rotations.x = value/360*2*Math.PI})
        controllers.rotateY?.attach((value) => {this.rotations.y = value/360*2*Math.PI})
        controllers.rotateZ?.attach((value) => {this.rotations.z = value/360*2*Math.PI})
        controllers.distance?.attach((value) => {this.distance = value})
    }
}
