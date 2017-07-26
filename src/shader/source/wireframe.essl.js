define(function () {
return "@export qtek.wireframe.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 world : WORLD;\n\nattribute vec3 position : POSITION;\nattribute vec3 barycentric;\n\n@import qtek.chunk.skinning_header\n\nvarying vec3 v_Barycentric;\n\nvoid main()\n{\n\n vec3 skinnedPosition = position;\n#ifdef SKINNING\n\n @import qtek.chunk.skin_matrix\n\n skinnedPosition = (skinMatrixWS * vec4(position, 1.0)).xyz;\n#endif\n\n gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0 );\n\n v_Barycentric = barycentric;\n}\n\n@end\n\n\n@export qtek.wireframe.fragment\n\nuniform vec3 color : [0.0, 0.0, 0.0];\n\nuniform float alpha : 1.0;\nuniform float lineWidth : 1.0;\n\nvarying vec3 v_Barycentric;\n\n\n@import qtek.util.edge_factor\n\nvoid main()\n{\n\n gl_FragColor.rgb = color;\n gl_FragColor.a = (1.0-edgeFactor(lineWidth)) * alpha;\n}\n\n@end";
});