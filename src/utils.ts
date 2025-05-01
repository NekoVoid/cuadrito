function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function millisToMinutes(millis: number,
  options: { showSeconds?: boolean, millisDigits?: number, minuteDigits?: number } = {})
{
  let { showSeconds = true, millisDigits = 0, minuteDigits = 0 } = options;
  millisDigits = clamp(millisDigits, 0, 3);
  const minutes = Math.floor(millis / 60000);
  const minuteStr = minutes.toString().padStart(minuteDigits, "0");
  if(!showSeconds) return minuteStr;

  const secondsInMin = Math.floor(millis/1000) % 60 ;
  const secondsStr = secondsInMin.toString().padStart(2, "0")
  if(millisDigits === 0) return `${minuteStr}:${secondsStr}`;

  const millisInSec = Math.floor(millis % 1000);
  return `${minuteStr}:${secondsStr}.${millisInSec.toString().padStart(3,'0').slice(0, millisDigits)}`;
}

export { clamp, millisToMinutes };

