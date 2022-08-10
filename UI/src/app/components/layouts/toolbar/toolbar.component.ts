import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
// import { OverlayContainer } from '@angular/cdk/overlay';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService, CommonService } from 'services';
import { RouteMap } from 'src/app/interfaces';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  themeColor: 'primary' | 'accent' | 'warn' = 'primary'; // ? notice this
  isMobile: any;
  innerWidth: any;
  public title: string = '';
  private wasInside: boolean = false;
  private routeNameMapList: Array<RouteMap> = [];
  @Output() toggleChange: EventEmitter<any> = new EventEmitter();
  @Input() toggle: boolean = true;
  @Output() refreshChange: EventEmitter<any> = new EventEmitter();
  @Input() refresh: boolean = true;
  @Output() backForwardActionChange: EventEmitter<any> = new EventEmitter();
  @Input() backForwardA: any;
  @Input() isAccSetting: boolean = false;
  @Input() mobile: boolean = true;
  @Input() backForward: any;
  indexBF: number;
  arrBackForward: any = [];
  // @HostListener('click')
  // clickInside() {
  //   this.wasInside = true;
  // }
  // @HostListener('document:click')
  // clickout() {
  //   if (!this.wasInside) {
  //     console.log('clicked outside');
  //   }
  //   this.wasInside = false;
  // }
  constructor(
    // private overlayContainer: OverlayContainer,
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {
    this.routeNameMapList = [
      {
        name: 'Dashboard',
        url: '/dashboard',
      },
      {
        name: 'Projects',
        url: '/projects',
      },
      {
        name: 'Profiles',
        url: '/profiles',
      },
      {
        name: 'Messages',
        url: '/messages',
      },
      {
        name: 'Account Plan',
        url: '/pricing',
      },
      {
        name: 'Payment',
        url: '/payment',
      },
      {
        name: 'My account',
        url: '/user/my-account',
      },
      {
        name: 'Change Password',
        url: '/user/change-password',
      },
      {
        name: 'Change Email',
        url: '/user/change-email',
      },
      {
        name: 'Favorite & Blacklist Profiles',
        url: '/user/favorite-blacklist-profile',
      },
      {
        name: 'Profile Details',
        url: '/profile-details',
      },
      {
        name: 'Project Details',
        url: '/projects/',
      },
      {
        name: 'Call Sheet',
        url: '/call-sheet',
      },
      {
        name: 'Notifications',
        url: 'notifications',
      },
      {
        name: 'Agency',
        url: 'agency',
      },
      {
        name: 'Agency Details',
        url: '/agcy-details/',
      },
      {
        name: 'Manage Subscription',
        url: '/manage-subscription',
      },
      {
        name: 'Insurance',
        url: '/insurance',
      },
      {
        name: 'Watch',
        url: '/watch',
      },
      {
        name: 'Matched Rolecalls',
        url: '/matched-rolecalls/',
      },
      {
        name: 'Matched Profiles',
        url: '/matched-profiles/',
      },
      {
        name: 'Invite Confirmation',
        url: '/invite-team-confirmation/',
      },
      {
        name: 'List Auditions',
        url: '/pubaudition',
      },
      {
        name: 'Rolecalls',
        url: '/rolecalls',
      },
      {
        name: 'Subscription Details',
        url: '/subcrpt-details',
      },
    ];
    let index: number;
    this.subscription.add(
      this.router.events.subscribe(() => {
        if (this.router.navigated) {
          index = this.routeNameMapList.findIndex((ele) =>
            this.router.url.includes(ele.url)
          );
          this.title = index > -1 ? this.routeNameMapList[index].name : '';
        }
      })
    );
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.backForward && changes.backForward.currentValue) {
      this.indexBF = changes.backForward.currentValue.indexBF;
      this.arrBackForward = changes.backForward.currentValue.arrBackForward;
    }
  }

  public toggleSideBar(): void {
    this.toggleChange.emit(!this.toggle);
  }

  public clickRefresh(): void {
    this.refreshChange.emit(!this.refresh);
    this.refresh = true;
  }

  public clickBackForward(action: string): void {
    this.backForwardA = {
      action,
    };
    this.backForwardActionChange.emit(this.backForwardA);
  }

  logOut() {}
  // getEventTheme(ev: boolean): void {
  //   if (ev) {
  //     this.overlayContainer.getContainerElement().classList.add('dark-theme');
  //     this.themeColor = 'accent';
  //   } else {
  //     this.overlayContainer
  //       .getContainerElement()
  //       .classList.remove('dark-theme');
  //     this.themeColor = 'primary';
  //   }
  // }

  onNavToDashBoard(): void {
    this.router.navigate(['dashboard']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
