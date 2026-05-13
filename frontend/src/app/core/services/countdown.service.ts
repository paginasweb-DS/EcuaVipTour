import { Injectable } from '@angular/core';
import { Observable, timer, map, takeWhile, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  
  getCountdown(targetDate: string): Observable<{time: string, isCritical: boolean, isExpired: boolean}> {
    const target = new Date(targetDate).getTime();
    
    return timer(0, 1000).pipe(
      map(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff <= 0) {
          return { time: '00:00', isCritical: false, isExpired: true };
        }
        
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        return {
          time: formattedTime,
          isCritical: minutes < 5,
          isExpired: false
        };
      }),
      takeWhile(val => !val.isExpired, true),
      shareReplay(1)
    );
  }
}
