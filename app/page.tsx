"use client";

import Image from "next/image";
import {
  CSSProperties,
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

type PullSwitchStyle = CSSProperties & {
  "--chain-angle": string;
  "--chain-length": string;
};

export default function Home() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const [lightOn, setLightOn] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [chainAngle, setChainAngle] = useState(0);
  const [chainLength, setChainLength] = useState(68);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const lastChainSound = useRef({ angle: 0, time: 0 });
  const lastErrorSoundAt = useRef(0);

  function getAudioContext() {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    if (audioContext.current.state === "suspended") {
      void audioContext.current.resume();
    }

    return audioContext.current;
  }

  function createNoise(ctx: AudioContext, duration: number) {
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * duration),
      ctx.sampleRate,
    );
    const samples = buffer.getChannelData(0);

    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  function playChainSound(angle: number) {
    const now = performance.now();
    const angleDelta = Math.abs(angle - lastChainSound.current.angle);

    if (now - lastChainSound.current.time < 48 || angleDelta < 1.4) return;

    lastChainSound.current = { angle, time: now };
    const ctx = getAudioContext();
    const start = ctx.currentTime;
    const intensity = Math.min(1, 0.28 + angleDelta / 12);
    const noise = createNoise(ctx, 0.055);
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(4200 + Math.random() * 1300, start);
    filter.Q.setValueAtTime(7, start);
    gain.gain.setValueAtTime(0.018 * intensity, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);

    ping.type = "sine";
    ping.frequency.setValueAtTime(3100 + Math.random() * 900, start);
    ping.frequency.exponentialRampToValueAtTime(2200, start + 0.035);
    pingGain.gain.setValueAtTime(0.012 * intensity, start);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    ping.connect(pingGain).connect(ctx.destination);
    noise.start(start);
    noise.stop(start + 0.055);
    ping.start(start);
    ping.stop(start + 0.05);
  }

  function playLightSwitch(turningOn: boolean) {
    const ctx = getAudioContext();
    const start = ctx.currentTime + 0.16;
    const click = createNoise(ctx, 0.075);
    const clickFilter = ctx.createBiquadFilter();
    const clickGain = ctx.createGain();
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    clickFilter.type = "bandpass";
    clickFilter.frequency.setValueAtTime(1650, start);
    clickFilter.Q.setValueAtTime(1.8, start);
    clickGain.gain.setValueAtTime(0.08, start);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);

    body.type = "triangle";
    body.frequency.setValueAtTime(150, start);
    body.frequency.exponentialRampToValueAtTime(68, start + 0.075);
    bodyGain.gain.setValueAtTime(0.07, start);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);

    click.connect(clickFilter).connect(clickGain).connect(ctx.destination);
    body.connect(bodyGain).connect(ctx.destination);
    click.start(start);
    click.stop(start + 0.075);
    body.start(start);
    body.stop(start + 0.085);

    if (!turningOn) return;

    const electricity = createNoise(ctx, 0.34);
    const electricFilter = ctx.createBiquadFilter();
    const electricGain = ctx.createGain();
    const glow = ctx.createOscillator();
    const glowGain = ctx.createGain();

    electricFilter.type = "highpass";
    electricFilter.frequency.setValueAtTime(2300, start + 0.045);
    electricGain.gain.setValueAtTime(0.0001, start + 0.045);
    electricGain.gain.linearRampToValueAtTime(0.018, start + 0.085);
    electricGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

    glow.type = "sine";
    glow.frequency.setValueAtTime(82, start + 0.04);
    glowGain.gain.setValueAtTime(0.0001, start + 0.04);
    glowGain.gain.linearRampToValueAtTime(0.022, start + 0.1);
    glowGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

    electricity
      .connect(electricFilter)
      .connect(electricGain)
      .connect(ctx.destination);
    glow.connect(glowGain).connect(ctx.destination);
    electricity.start(start + 0.045);
    electricity.stop(start + 0.34);
    glow.start(start + 0.04);
    glow.stop(start + 0.34);
  }

  function playLoginSuccess() {
    const ctx = getAudioContext();
    const start = ctx.currentTime;
    const notes = [
      { frequency: 392, delay: 0 },
      { frequency: 493.88, delay: 0.08 },
      { frequency: 659.25, delay: 0.16 },
    ];

    notes.forEach(({ frequency, delay }, index) => {
      const tone = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const toneGain = ctx.createGain();
      const noteStart = start + delay;
      const noteEnd = noteStart + 0.52 - index * 0.06;

      tone.type = "sine";
      tone.frequency.setValueAtTime(frequency, noteStart);
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(frequency * 2, noteStart);

      toneGain.gain.setValueAtTime(0.0001, noteStart);
      toneGain.gain.exponentialRampToValueAtTime(0.04, noteStart + 0.025);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      tone.connect(toneGain);
      shimmer.connect(toneGain);
      toneGain.connect(ctx.destination);
      tone.start(noteStart);
      shimmer.start(noteStart);
      tone.stop(noteEnd);
      shimmer.stop(noteEnd);
    });

    const pulse = ctx.createOscillator();
    const pulseGain = ctx.createGain();
    pulse.type = "sine";
    pulse.frequency.setValueAtTime(72, start);
    pulse.frequency.exponentialRampToValueAtTime(46, start + 0.22);
    pulseGain.gain.setValueAtTime(0.055, start);
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    pulse.connect(pulseGain).connect(ctx.destination);
    pulse.start(start);
    pulse.stop(start + 0.25);
  }

  function playLoginError() {
    const now = performance.now();
    if (now - lastErrorSoundAt.current < 400) return;
    lastErrorSoundAt.current = now;

    const ctx = getAudioContext();
    const start = ctx.currentTime;
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();

    tone.type = "sine";
    tone.frequency.setValueAtTime(138, start);
    tone.frequency.exponentialRampToValueAtTime(92, start + 0.24);
    gain.gain.setValueAtTime(0.045, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    tone.connect(gain).connect(ctx.destination);
    tone.start(start);
    tone.stop(start + 0.29);
  }

  function toggleLight() {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    if (pulling) return;
    setPulling(true);
    playLightSwitch(!lightOn);
    window.setTimeout(() => setLightOn((current) => !current), 190);
    window.setTimeout(() => setPulling(false), 570);
  }

  function updateChain(clientX: number, clientY: number) {
    const pullSwitch = document.querySelector<HTMLButtonElement>(".pull-switch");
    if (!pullSwitch) return;

    const bounds = pullSwitch.getBoundingClientRect();
    const pivotX = bounds.left + bounds.width / 2;
    const pivotY = bounds.top;
    const restingLength = bounds.height * 0.68;
    const horizontalTravel = clientX - pivotX;
    const maximumAngle = 38;
    const maximumTravel = Math.sin((maximumAngle * Math.PI) / 180) * restingLength;
    const constrainedTravel = Math.max(
      -maximumTravel,
      Math.min(maximumTravel, horizontalTravel),
    );
    const angle =
      (Math.asin(constrainedTravel / restingLength) * 180) / Math.PI;
    const verticalPull = Math.max(0, clientY - (pivotY + restingLength));
    const extraLength = Math.min(16, (verticalPull / bounds.height) * 100);

    setChainAngle(angle);
    setChainLength(68 + extraLength);
    playChainSound(angle);
  }

  function startDragging(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    getAudioContext();
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    didDrag.current = false;
    lastChainSound.current = { angle: chainAngle, time: 0 };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function dragChain(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging) return;

    const distance = Math.hypot(
      event.clientX - dragOrigin.current.x,
      event.clientY - dragOrigin.current.y,
    );

    if (distance > 4) didDrag.current = true;
    updateChain(event.clientX, event.clientY);
  }

  function releaseChain(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragging) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragging(false);
    setChainAngle(0);
    setChainLength(68);
  }

  function cancelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    didDrag.current = false;
    releaseChain(event);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthenticated(true);
    setMessage("Acesso realizado.");
    playLoginSuccess();
  }

  return (
    <main className={`scene${lightOn ? " light-on" : ""}`}>
      <div className="scene-canvas">
        {/* Arte, escurecimento e cordão compartilham o mesmo palco: o cordão é posicionado em % do palco e, portanto, fica preso ao abajur em qualquer enquadramento. */}
        <div className="scene-stage">
        <Image
          className="scene-art"
          src={`${basePath}/lamp-scene-v2.png`}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-aspect-ratio: 4/5) 160vw, 100vw"
        />
        <div className="blackout" aria-hidden="true" />

        <button
          className={`pull-switch${pulling ? " pulling" : ""}${dragging ? " dragging" : ""}`}
          type="button"
          style={
            {
              "--chain-angle": `${chainAngle}deg`,
              "--chain-length": `${chainLength}%`,
            } as PullSwitchStyle
          }
          aria-pressed={lightOn}
          aria-label={lightOn ? "Apagar o abajur" : "Acender o abajur"}
          onClick={toggleLight}
          onPointerDown={startDragging}
          onPointerMove={dragChain}
          onPointerUp={releaseChain}
          onPointerCancel={cancelDrag}
        >
          <span className="chain-pendulum" aria-hidden="true">
            <span className="interactive-chain" />
            <span className="interactive-handle" />
          </span>
        </button>
        </div>

        <section className="login-wrap" aria-hidden={!lightOn}>
          <header className="brand">
            <h1>LIGHT</h1>
            <p className="brand-tagline">
              LOGIN EXPERIENCE <span>· DEVELOPED BY</span>
            </p>
            <div className="brand-credit">
              <span>x7rG Enterprise</span>
              <a
                href="https://www.instagram.com/_7Ragnar"
                target="_blank"
                rel="noreferrer"
              >
                @_7Ragnar
              </a>
            </div>
          </header>

          <form
            className={`login-card${authenticated ? " is-authenticated" : ""}`}
            onSubmit={handleSubmit}
            onInvalid={playLoginError}
          >
            <label className="field">
              <span className="field-icon user-icon" aria-hidden="true" />
              <span className="sr-only">E-mail</span>
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                autoComplete="email"
                tabIndex={lightOn ? 0 : -1}
                required
              />
            </label>

            <label className="field">
              <span className="field-icon lock-icon" aria-hidden="true" />
              <span className="sr-only">Senha</span>
              <input
                type="password"
                name="password"
                placeholder="Senha"
                autoComplete="current-password"
                minLength={6}
                tabIndex={lightOn ? 0 : -1}
                required
              />
            </label>

            <button
              className="submit-button"
              type="submit"
              tabIndex={lightOn ? 0 : -1}
              aria-label="Entrar"
            >
              <span aria-hidden="true">→</span>
            </button>

            <div className="card-detail" aria-hidden="true">
              <span />
              <i />
              <span />
            </div>

            <p className="form-message" role="status">
              {message}
            </p>
          </form>

        </section>
      </div>
    </main>
  );
}
