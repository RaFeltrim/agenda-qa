import { useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { Meeting } from '../../store/meetingStore';
import dayjs from 'dayjs';

// Base64-encoded short beep sound (sine wave, 200ms)
const BEEP_DATA_URI =
    'data:audio/wav;base64,UklGRl9vT19teleRmb3JtYXQAAAAAAWAAEAPAAAQAABAAQABAAoA' +
    'ZGF0YW9lAAA=';

// Fallback: generate a short beep using AudioContext
function playBeep() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);

        // Second beep
        setTimeout(() => {
            try {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1100;
                osc2.type = 'sine';
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.3);
            } catch { /* silent */ }
        }, 400);
    } catch {
        // Fallback: try Audio element
        try {
            const audio = new Audio(BEEP_DATA_URI);
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch { /* silent */ }
    }
}

/** Thresholds in minutes before meeting start */
const THRESHOLDS = [5, 2, 1, 0];

interface MeetingNotifierProps {
    meetings: Meeting[];
}

/**
 * MeetingNotifier — Monitors upcoming meetings and triggers
 * audio + visual notifications at 5min, 2min, 1min, and start time.
 */
export default function MeetingNotifier({ meetings }: MeetingNotifierProps) {
    // Track which notifications have already been sent: `meetingId-threshold`
    const sentRef = useRef<Set<string>>(new Set());

    const checkMeetings = useCallback(() => {
        const now = dayjs();

        meetings.forEach((meeting) => {
            if (meeting.status === 'realizada') return;
            if (!meeting.date || !meeting.time) return;

            const meetingDT = dayjs(`${meeting.date} ${meeting.time}`);
            const diffMin = meetingDT.diff(now, 'minute', true);

            THRESHOLDS.forEach((threshold) => {
                const key = `${meeting.id}-${threshold}`;
                if (sentRef.current.has(key)) return;

                // Check if we're within range of this threshold
                const isInRange = threshold === 0
                    ? diffMin <= 0.5 && diffMin > -2
                    : diffMin <= threshold && diffMin > threshold - 1;

                if (!isInRange) return;

                // Mark as sent
                sentRef.current.add(key);

                // Play sound
                playBeep();

                // Build notification message
                let message: string;
                let className: string;

                if (threshold === 0) {
                    message = `🔴 Sua reunião "${meeting.title}" COMEÇOU!`;
                    className = 'meeting-notification-urgent';
                } else if (threshold === 1) {
                    message = `🟠 Sua reunião "${meeting.title}" começará em 1 minuto!`;
                    className = 'meeting-notification-warning';
                } else if (threshold === 2) {
                    message = `🟡 Sua reunião "${meeting.title}" começará em 2 minutos!`;
                    className = 'meeting-notification-info';
                } else {
                    message = `🔔 Sua reunião "${meeting.title}" começará em 5 minutos!`;
                    className = 'meeting-notification-info';
                }

                // Show Ant Design notification
                notification.open({
                    message: 'Lembrete de Reunião',
                    description: (
                        <div>
                            <p className="font-semibold text-base mb-1">{message}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {dayjs(meeting.date).format('DD/MM')} às {meeting.time?.substring(0, 5)}
                            </p>
                            {meeting.meetingLink && (
                                <a
                                    href={meeting.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition-colors"
                                >
                                    Entrar na Reunião →
                                </a>
                            )}
                        </div>
                    ),
                    icon: <BellOutlined style={{ color: threshold === 0 ? '#ef4444' : '#f59e0b' }} />,
                    duration: threshold === 0 ? 0 : 15, // Persist for "started" notifications
                    placement: 'topRight',
                    className,
                });
            });
        });
    }, [meetings]);

    useEffect(() => {
        // Check immediately
        checkMeetings();

        // Check every 30 seconds
        const interval = setInterval(checkMeetings, 30000);
        return () => clearInterval(interval);
    }, [checkMeetings]);

    // Cleanup old sent notifications (older than 1 hour)
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = dayjs();
            const toRemove: string[] = [];

            sentRef.current.forEach((key) => {
                const meetingId = key.split('-')[0];
                const meeting = meetings.find(m => m.id === meetingId);
                if (meeting) {
                    const meetingDT = dayjs(`${meeting.date} ${meeting.time}`);
                    if (now.diff(meetingDT, 'hour') > 1) {
                        toRemove.push(key);
                    }
                }
            });

            toRemove.forEach(k => sentRef.current.delete(k));
        }, 300000); // every 5 min

        return () => clearInterval(cleanup);
    }, [meetings]);

    // This component renders nothing — it's a side-effect-only component
    return null;
}
