import * as THREE from 'three/webgpu'

THREE.Object3D.prototype.copy = function( source, recursive = true )
{
    this.name = source.name;

    this.up.copy( source.up );

    this.position.copy( source.position );
    this.rotation.order = source.rotation.order;
    this.quaternion.copy( source.quaternion );
    this.scale.copy( source.scale );

    this.matrix.copy( source.matrix );
    this.matrixWorld.copy( source.matrixWorld );

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.animations = source.animations.slice();

    // this.userData = JSON.parse( JSON.stringify( source.userData ) );

    if ( recursive === true ) {

        for ( let i = 0; i < source.children.length; i ++ ) {

            const child = source.children[ i ];
            this.add( child.clone() );

        }

    }

    return this;

}
