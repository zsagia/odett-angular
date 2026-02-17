import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface SequenceEvent {
  id: string;
  type: 'emission' | 'handling' | 'lifecycle';
  source: string;
  target?: string;
  eventName: string;
}

export interface EventSequenceData {
  events: SequenceEvent[];
  participants: string[];
}

@Component({
  selector: 'app-event-sequence',
  templateUrl: './event-sequence.html',
  styleUrl: './event-sequence.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventSequenceComponent {
  readonly data = input.required<EventSequenceData>();
  readonly title = input('');

  private readonly PARTICIPANT_WIDTH = 130;
  private readonly GAP = 60;
  private readonly HEADER_HEIGHT = 70;
  private readonly EVENT_GAP = 50;
  private readonly PADDING = 40;

  protected readonly layout = computed(() => {
    const d = this.data();
    const count = d.participants.length;
    const totalWidth = count * (this.PARTICIPANT_WIDTH + this.GAP) - this.GAP;
    const width = totalWidth + this.PADDING * 2;
    const height = this.PADDING + this.HEADER_HEIGHT + d.events.length * this.EVENT_GAP + this.PADDING;

    const positions = new Map<string, number>();
    d.participants.forEach((p, i) => {
      positions.set(
        p,
        this.PADDING + i * (this.PARTICIPANT_WIDTH + this.GAP) + this.PARTICIPANT_WIDTH / 2,
      );
    });

    return { width, height, positions };
  });

  protected readonly viewBox = computed(
    () => `0 0 ${this.layout().width} ${this.layout().height}`,
  );

  protected getParticipantX(participant: string): number {
    return this.layout().positions.get(participant) ?? 0;
  }

  protected getEventY(index: number): number {
    return this.HEADER_HEIGHT + 30 + index * this.EVENT_GAP;
  }

  protected getEventTypeColor(type: SequenceEvent['type']): string {
    switch (type) {
      case 'emission':
        return '#3b82f6';
      case 'handling':
        return '#10b981';
      case 'lifecycle':
        return '#f59e0b';
    }
  }

  protected truncateParticipant(name: string): string {
    return name.length > 16 ? name.slice(0, 13) + '...' : name;
  }

  protected getArrowLabelX(source: string, target: string): number {
    return (this.getParticipantX(source) + this.getParticipantX(target)) / 2;
  }
}
