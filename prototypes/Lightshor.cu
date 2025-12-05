// lightshard.cu  –  compile with nvcc -O3 --use-fast-math
__global__ void paradox_step(float4 *pos, float4 *vel, float *phase, uint *partner, curandState *rng, float t)
{
    uint i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i >= NUM_SHARDS) return;

    float3 p = make_float3(pos[i]);
    float3 v = make_float3(vel[i]);

    // paradox core – one sine, no branches
    float paradox = sin(phase[i] + t * 0.7f + curand_uniform(&rng[i])*0.01f);
    float3 force = normalize(center - p) * (paradox > 0 ? +1.0f : -1.0f) * 0.8f;

    // zeno damping so nothing ever explodes
    v = v * 0.999f + force * 0.001f;   
    p += v;

    // toroidal wrap (infinite game boundary)
    p = fract((p + 10.0f) / 20.0f) * 20.0f - 10.0f;

    pos[i] = make_float4(p, 1.0f);
    vel[i] = make_float4(v, 0);
    phase[i] += 0.01337f + sin(t*0.1f)*0.002f;  // slow global drift
}
