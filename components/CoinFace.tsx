// The two faces of One Timi. Modelled and rendered in Blender (Cycles): the relief is real geometry, lit by a low sun from the top left.
// The scene and the height maps are in tools/coin.
export function CoinFace({ side }: { side: 'front' | 'back'; idp?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="coin-svg" src={`/coin/${side}.webp`} alt="" width={600} height={600} draggable={false} />;
}
