import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { EventService } from '../services/event.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  faBars = faBars;
  faSearch = faSearch;
  isSmallScreen: boolean = false;
  isLoggedIn: boolean = false;
  loggedInWithGoogle: boolean = false;
  searchInput: string = ''; 
  userName: string = '';
  userEmail: string = '';
  languages = [
    
    { code: 'en', label: 'En' },
    { code: 'ar', label: 'الع'}, 
    { code: 'hu', label: 'hu' }  
  ];
  
  currentLanguage = 'en';
  private authSubscription!: Subscription;
  private googleAuthSubscription!: Subscription;
  private tokenCheckInterval: number | null = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private userService: UserService,
    private router: Router,
    private eventService: EventService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.handleResize);

    this.authSubscription = this.userService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
      
      this.changeDetectorRef.detectChanges();
    });

    this.googleAuthSubscription = this.userService.loggedInWithGoogle$.subscribe(status => {
      this.loggedInWithGoogle = status;
      this.changeDetectorRef.detectChanges();
    });
    this.tokenCheckInterval = setInterval(() => {
      if (this.userService.isTokenExpired()) {
        this.userService.logout();
        this.isLoggedIn = false;
        this.changeDetectorRef.detectChanges();
      }
    }, 60000) as unknown as number;
    this.userService.userDetails$.subscribe(details => {
      if (details) {
        this.userName = details.name;
        this.userEmail = details.email;
      } else {
        this.userName = '';
        this.userEmail = '';
      }
    });

    this.setUserDetails();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.googleAuthSubscription) {
      this.googleAuthSubscription.unsubscribe();
    }
    if (this.tokenCheckInterval !== null) {
      clearInterval(this.tokenCheckInterval);
    }
  }
 
  handleResize = () => {
    this.ngZone.run(() => {
      this.isSmallScreen = window.innerWidth <= 1000;
      this.changeDetectorRef.detectChanges();
    });
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 860;
  }
  switchLanguage(language: string) {
    this.currentLanguage = language;
    this.translate.use(language);
  }

  setUserDetails() {
    
    const tokenDetails = this.userService.getDecodedToken();
    if (tokenDetails) {
      this.userName = tokenDetails.full_name; 
      this.userEmail = tokenDetails.email; 
    }
  }

  logout() {
    this.userService.logout(); 
    this.router.navigate(['/home']); 
  }
  navigateToChangePassword() {
    this.router.navigate(['/change-password']); 
  }
  navigateToCreateEvent() {
    this.router.navigate(['/create-event']); 
  }
  onSearchChange(): void {
    
    this.eventService.searchEvents(this.searchInput).subscribe(); 
  }
  navigateToManageEvents() {
    this.router.navigate(['/manage-events']);
  }
}
