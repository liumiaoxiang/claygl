define(function () {
return "@export qtek.compositor.util.sample\n\n@import qtek.util.rgbm\n/* switch to pre-multiplied alpha to correctly blur transparent images */\n// PENDING\nvec4 sample(const in sampler2D texture, const in vec2 coord)\n{\n    vec4 tex = decodeHDR(texture2D(texture, coord));\n    // tex.rgb *= tex.a;\n    return tex;\n}\n@end\n\n@export qtek.compositor.gaussian_blur_h\n\nuniform sampler2D texture; // the texture with the scene you want to blur\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\nuniform float textureWidth : 512.0;\n\n@import qtek.compositor.util.sample\n\nvoid main (void)\n{\n    vec4 sum = vec4(0.0);\n    float blurOffset = blurSize / textureWidth;\n    // blur in y (vertical)\n    // take nine samples, with the distance blurSize between them\n    sum += sample(texture, vec2(max(v_Texcoord.x - 4.0*blurOffset, 0.0), v_Texcoord.y)) * 0.05;\n    sum += sample(texture, vec2(max(v_Texcoord.x - 3.0*blurOffset, 0.0), v_Texcoord.y)) * 0.09;\n    sum += sample(texture, vec2(max(v_Texcoord.x - 2.0*blurOffset, 0.0), v_Texcoord.y)) * 0.12;\n    sum += sample(texture, vec2(max(v_Texcoord.x - blurOffset, 0.0), v_Texcoord.y)) * 0.15;\n    sum += sample(texture, vec2(v_Texcoord.x, v_Texcoord.y)) * 0.18;\n    sum += sample(texture, vec2(min(v_Texcoord.x + blurOffset, 1.0), v_Texcoord.y)) * 0.15;\n    sum += sample(texture, vec2(min(v_Texcoord.x + 2.0*blurOffset, 1.0), v_Texcoord.y)) * 0.12;\n    sum += sample(texture, vec2(min(v_Texcoord.x + 3.0*blurOffset, 1.0), v_Texcoord.y)) * 0.09;\n    sum += sample(texture, vec2(min(v_Texcoord.x + 4.0*blurOffset, 1.0), v_Texcoord.y)) * 0.05;\n\n    // sum.rgb /= sum.a + 0.0000001;\n\n    gl_FragColor = encodeHDR(sum);\n}\n\n@end\n\n@export qtek.compositor.gaussian_blur_v\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\nuniform float textureHeight : 512.0;\n\n@import qtek.compositor.util.sample\n\nvoid main(void)\n{\n    vec4 sum = vec4(0.0);\n    float blurOffset = blurSize / textureHeight;\n    // blur in y (vertical)\n    // take nine samples, with the distance blurSize between them\n    sum += sample(texture, vec2(v_Texcoord.x, max(v_Texcoord.y - 4.0*blurOffset, 0.0))) * 0.05;\n    sum += sample(texture, vec2(v_Texcoord.x, max(v_Texcoord.y - 3.0*blurOffset, 0.0))) * 0.09;\n    sum += sample(texture, vec2(v_Texcoord.x, max(v_Texcoord.y - 2.0*blurOffset, 0.0))) * 0.12;\n    sum += sample(texture, vec2(v_Texcoord.x, max(v_Texcoord.y - blurOffset, 0.0))) * 0.15;\n    sum += sample(texture, vec2(v_Texcoord.x, v_Texcoord.y)) * 0.18;\n    sum += sample(texture, vec2(v_Texcoord.x, min(v_Texcoord.y + blurOffset, 1.0))) * 0.15;\n    sum += sample(texture, vec2(v_Texcoord.x, min(v_Texcoord.y + 2.0*blurOffset, 1.0))) * 0.12;\n    sum += sample(texture, vec2(v_Texcoord.x, min(v_Texcoord.y + 3.0*blurOffset, 1.0))) * 0.09;\n    sum += sample(texture, vec2(v_Texcoord.x, min(v_Texcoord.y + 4.0*blurOffset, 1.0))) * 0.05;\n\n    // sum.rgb /= sum.a + 0.0000001;\n\n    gl_FragColor = encodeHDR(sum);\n}\n\n@end\n\n@export qtek.compositor.box_blur\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 3.0;\nuniform vec2 textureSize : [512.0, 512.0];\n\n@import qtek.compositor.util.sample\n\nvoid main(void)\n{\n\n    vec4 tex = texture2D(texture, v_Texcoord);\n    vec2 offset = blurSize / textureSize;\n\n    tex += sample(texture, v_Texcoord + vec2(offset.x, 0.0) );\n    tex += sample(texture, v_Texcoord + vec2(offset.x, offset.y) );\n    tex += sample(texture, v_Texcoord + vec2(-offset.x, offset.y) );\n    tex += sample(texture, v_Texcoord + vec2(0.0, offset.y) );\n    tex += sample(texture, v_Texcoord + vec2(-offset.x, 0.0) );\n    tex += sample(texture, v_Texcoord + vec2(-offset.x, -offset.y) );\n    tex += sample(texture, v_Texcoord + vec2(offset.x, -offset.y) );\n    tex += sample(texture, v_Texcoord + vec2(0.0, -offset.y) );\n\n    tex /= 9.0;\n\n    // tex.rgb /= tex.a + 0.0000001;\n\n    gl_FragColor = encodeHDR(tex);\n}\n\n@end\n\n\n\n\n\n// http://www.slideshare.net/DICEStudio/five-rendering-ideas-from-battlefield-3-need-for-speed-the-run\n@export qtek.compositor.hexagonal_blur_mrt_1\n\n// MRT in chrome\n// https://www.khronos.org/registry/webgl/sdk/tests/conformance/extensions/webgl-draw-buffers.html\n#extension GL_EXT_draw_buffers : require\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\n\nuniform vec2 textureSize : [512.0, 512.0];\n\nvoid main(void){\n    vec2 offset = blurSize / textureSize;\n\n    vec4 color = vec4(0.0);\n    // Top\n    for(int i = 0; i < 10; i++){\n        color += 1.0/10.0 * texture2D(texture, v_Texcoord + vec2(0.0, offset.y * float(i)) );\n    }\n    gl_FragData[0] = color;\n    vec4 color2 = vec4(0.0);\n    // Down left\n    for(int i = 0; i < 10; i++){\n        color2 += 1.0/10.0 * texture2D(texture, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n    }\n    gl_FragData[1] = (color + color2) / 2.0;\n}\n\n@end\n\n@export qtek.compositor.hexagonal_blur_mrt_2\n\nuniform sampler2D texture0;\nuniform sampler2D texture1;\n\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\n\nuniform vec2 textureSize : [512.0, 512.0];\n\nvoid main(void){\n    vec2 offset = blurSize / textureSize;\n\n    vec4 color1 = vec4(0.0);\n    // Down left\n    for(int i = 0; i < 10; i++){\n        color1 += 1.0/10.0 * texture2D(texture0, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n    }\n    vec4 color2 = vec4(0.0);\n    // Down right\n    for(int i = 0; i < 10; i++){\n        color2 += 1.0/10.0 * texture2D(texture1, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n    }\n\n    gl_FragColor = (color1 + color2) / 2.0;\n}\n\n@end\n\n\n@export qtek.compositor.hexagonal_blur_1\n\n#define KERNEL_SIZE 10\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform vec2 textureSize : [512.0, 512.0];\n\nvoid main(void){\n    vec2 offset = blurSize / textureSize;\n\n    vec4 color = vec4(0.0);\n    float fKernelSize = float(KERNEL_SIZE);\n    // Top\n    for(int i = 0; i < KERNEL_SIZE; i++){\n        color += 1.0 / fKernelSize * texture2D(texture, v_Texcoord + vec2(0.0, offset.y * float(i)) );\n    }\n    gl_FragColor = color;\n}\n\n@end\n\n@export qtek.compositor.hexagonal_blur_2\n\n#define KERNEL_SIZE 10\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform vec2 textureSize : [512.0, 512.0];\n\nvoid main(void){\n    vec2 offset = blurSize / textureSize;\n    offset.y /= 2.0;\n\n    vec4 color = vec4(0.0);\n    float fKernelSize = float(KERNEL_SIZE);\n    // Down left\n    for(int i = 0; i < KERNEL_SIZE; i++){\n        color += 1.0/fKernelSize * texture2D(texture, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n    }\n    gl_FragColor = color;\n}\n@end\n\n@export qtek.compositor.hexagonal_blur_3\n\n#define KERNEL_SIZE 10\n\nuniform sampler2D texture1;\nuniform sampler2D texture2;\n\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform vec2 textureSize : [512.0, 512.0];\n\nvoid main(void){\n    vec2 offset = blurSize / textureSize;\n    offset.y /= 2.0;\n\n    vec4 color1 = vec4(0.0);\n    float fKernelSize = float(KERNEL_SIZE);\n    // Down left\n    for(int i = 0; i < KERNEL_SIZE; i++){\n        color1 += 1.0/fKernelSize * texture2D(texture1, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n    }\n    vec4 color2 = vec4(0.0);\n    // Down right\n    for(int i = 0; i < KERNEL_SIZE; i++){\n        color2 += 1.0/fKernelSize * texture2D(texture1, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n    }\n\n    vec4 color3 = vec4(0.0);\n    // Down right\n    for(int i = 0; i < KERNEL_SIZE; i++){\n        color3 += 1.0/fKernelSize * texture2D(texture2, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n    }\n\n    gl_FragColor = (color1 + color2 + color3) / 3.0;\n}\n\n@end";
});